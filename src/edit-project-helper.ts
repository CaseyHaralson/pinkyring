import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import rimraf from 'rimraf';
import os from 'os';
import {IPinkyringConfig, TemplateRemovableOption} from './IPinkyringConfig';
import inquirer, {Answers} from 'inquirer';
import {isText} from 'istextorbinary';

const CURR_DIR = process.cwd();

const CONTENT_TO_SKIP_LINE_EDITS = [
  '.pinkyring.json',
  'node_modules',
  'build',
  'package.lock.json',
  'package.json',
  'tsconfig.json',
  'tsconfig.tsbuildinfo',
  '__pycache__',
  '.ipynb_checkpoints',
];

const CONTENT_TO_SKIP_CONFIG_EDITS = [
  'node_modules',
  'build',
  '__pycache__',
  '.ipynb_checkpoints',
];

export function editProject() {
  const templateConfig = readPinkyringFile();
  if (templateConfig) {
    const removalChoices = buildRemovalChoices(templateConfig);
    const question = buildRemovalQuestion(removalChoices);
    inquirer.prompt(question).then((answers: Answers) => {
      const remove = answers['remove'];
      if (remove === 'Cancel') {
        sayGoodbye();
        return;
      }

      if (remove === 'PINKYRING HOOKS') {
        confirmAndRemovePinkyringHooks(templateConfig);
        return;
      }

      const removableOption = getRemovableOption(templateConfig, remove);
      removeGlobs(removableOption);
      removeContent(removableOption);
      removeTypescriptReferences(removableOption);
      removePackageReferences(removableOption);
      removeScriptReferences(removableOption);
      saveOptionAsRemoved(templateConfig, removableOption);

      wrapUp(removableOption);
    });
  }
}

function readPinkyringFile() {
  const pinkyringFilePath = path.join(CURR_DIR, '.pinkyring.json');
  if (!fs.existsSync(pinkyringFilePath)) {
    console.log(
      chalk.red(
        `The .pinkyring file couldn't be found. This command needs to be run from inside a project that was created with pinkyring.`
      )
    );
    return null;
  }

  const templateConfig: IPinkyringConfig = JSON.parse(
    fs.readFileSync(pinkyringFilePath, 'utf8')
  );

  if (templateConfig.fileLocked === true) {
    console.log(
      `All of the pinkyring template hooks were removed from this project and the .pinkyring file was locked. No more edits can be made.`
    );
    return null;
  }

  return templateConfig;
}

function buildRemovalChoices(templateConfig: IPinkyringConfig) {
  //console.log(`Template config: ${JSON.stringify(templateConfig)}`);
  const choices: string[] = [];
  templateConfig.removableOptions.forEach((option) => {
    if (
      option.removed === null ||
      option.removed === undefined ||
      option.removed === false
    ) {
      choices.push(option.label);
    }
  });
  return choices;
}

function buildRemovalQuestion(removalChoices: string[]) {
  const questions = [
    {
      name: 'remove',
      type: 'list',
      message: 'What would you like to remove?',
      loop: false,
      pageSize: 10,
      choices: [...removalChoices, 'Cancel', 'PINKYRING HOOKS'],
    },
  ];
  return questions;
}

function confirmAndRemovePinkyringHooks(templateConfig: IPinkyringConfig) {
  const question = [
    {
      name: 'remove',
      type: 'list',
      message:
        'This will remove all the pinkyring hooks that allow you to remove pieces of the template. Are you sure?',
      choices: ['YES', 'NO'],
    },
  ];
  inquirer.prompt(question).then((answers: Answers) => {
    const remove = answers['remove'];
    if (remove === 'NO') {
      editProject();
    } else {
      removeAllPinkyringHooks(templateConfig);
      lockPinkyringFile(templateConfig);
      console.log(
        chalk.green(`All the leftover pinkyring template hooks were removed!`)
      );
      sayGoodbye();
    }
  });
}

function getRemovableOption(templateConfig: IPinkyringConfig, remove: string) {
  let removableOption: TemplateRemovableOption = null;
  templateConfig.removableOptions.forEach((option) => {
    if (option.label === remove) {
      removableOption = option;
      return removableOption;
    }
  });
  return removableOption;
}

function wrapUp(removableOption: TemplateRemovableOption) {
  console.log(chalk.green(`${removableOption.label} was removed.`));

  const question = [
    {
      name: 'remove',
      type: 'list',
      message: 'Would you like to remove anything else?',
      choices: ['YES', 'NO'],
    },
  ];

  inquirer.prompt(question).then((answers: Answers) => {
    const remove = answers['remove'];
    if (remove === 'NO') {
      sayGoodbye();
      return;
    } else editProject();
  });
}

function sayGoodbye() {
  console.log(`Goodbye!`);
}

function removeGlobs(removableOption: TemplateRemovableOption) {
  if (removableOption.globPatterns && removableOption.globPatterns.length > 0) {
    removableOption.globPatterns.forEach((pattern) => {
      rimraf.sync(pattern);
    });
  }
}

function removeContent(removableOption: TemplateRemovableOption) {
  // for each file in folder and subfolder
  // read content and look for pattern
  // when find start, stop writing content
  // then when find end, start writing content again
  if (
    removableOption.contentPattern &&
    removableOption.contentPattern.length > 0
  ) {
    editEachFile(CURR_DIR, removableOption.contentPattern);
  }
}

function editEachFile(folderPath: string, contentPattern: string) {
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    if (CONTENT_TO_SKIP_LINE_EDITS.includes(file)) return;

    const filePath = path.join(folderPath, file);
    const fileStats = fs.statSync(filePath);
    if (fileStats.isFile() && isText(file)) {
      // read and edit file if necessary
      const fileContents = fs.readFileSync(filePath, 'utf8');
      if (fileContents.indexOf(contentPattern) !== -1) {
        const fileLines = fileContents.split(/\r?\n/);
        const lastLineIndex = fileLines.length - 1;

        // recreate the file
        fs.writeFileSync(filePath, '', 'utf8');

        // read each line and remove sections of the content pattern
        let write = true;
        fileLines.forEach((line, index) => {
          if (write && line.indexOf(contentPattern) > -1) {
            write = false;
          } else if (write) {
            // append an EOL if not the last line
            if (index < lastLineIndex) {
              fs.appendFileSync(filePath, line + os.EOL, 'utf8');
            } else {
              fs.appendFileSync(filePath, line, 'utf8');
            }
          } else if (line.indexOf(contentPattern + '.end') > -1) {
            write = true;
          }
        });
      }
    } else if (fileStats.isDirectory()) {
      // recursively go through each directory
      editEachFile(filePath, contentPattern);
    }
  });
}

function removeTypescriptReferences(removableOption: TemplateRemovableOption) {
  if (
    removableOption.typescriptReferences &&
    removableOption.typescriptReferences.length > 0
  ) {
    editEachTsConfig(CURR_DIR, removableOption.typescriptReferences);
  }
}

function editEachTsConfig(folderPath: string, patterns: string[]) {
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    if (CONTENT_TO_SKIP_CONFIG_EDITS.includes(file)) return;

    const filePath = path.join(folderPath, file);
    const fileStats = fs.statSync(filePath);
    if (fileStats.isFile() && file === 'tsconfig.json') {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(fileContents);

      // check each reference and see if matches one of the patterns
      // if it does, splice the item out of the references
      let editedTheFile = false;
      if (json.references && json.references.length > 0) {
        for (let i = json.references.length - 1; i >= 0; i--) {
          const jsonItem = json.references[i];
          if (jsonItem.path) {
            patterns.forEach((pattern) => {
              if (jsonItem.path.indexOf(pattern) > -1) {
                json.references.splice(i, 1);
                editedTheFile = true;
                return;
              }
            });
          }
        }
      }

      if (editedTheFile) {
        // recreate the file
        fs.writeFileSync(filePath, '', 'utf8');

        const newFileContents = JSON.stringify(json, null, 2);
        const newFileLines = newFileContents.split(/\r?\n/);
        newFileLines.forEach((line) => {
          fs.appendFileSync(filePath, line + os.EOL, 'utf8');
        });
      }
    } else if (fileStats.isDirectory()) {
      // recursively go through each directory
      editEachTsConfig(filePath, patterns);
    }
  });
}

function removePackageReferences(removableOption: TemplateRemovableOption) {
  if (removableOption.packageNames && removableOption.packageNames.length > 0) {
    editEachPackageDependencies(CURR_DIR, removableOption.packageNames);
  }
}

function editEachPackageDependencies(folderPath: string, names: string[]) {
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    if (CONTENT_TO_SKIP_CONFIG_EDITS.includes(file)) return;

    const filePath = path.join(folderPath, file);
    const fileStats = fs.statSync(filePath);
    if (fileStats.isFile()) {
      if (file === 'package.json')
        removeDependencyFromPackageJson(filePath, names);
      else if (file === 'environment.yml')
        removeDependencyFromEnvironmentYml(filePath, names);
      else if (file === 'requirements.txt')
        removeDependencyFromRequirementsTxt(filePath, names);
    } else if (fileStats.isDirectory()) {
      // recursively go through each directory
      editEachPackageDependencies(filePath, names);
    }
  });
}

function removeDependencyFromPackageJson(filePath: string, names: string[]) {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(fileContents);

  let editedTheFile = false;
  if (json.dependencies) {
    names.forEach((name) => {
      if (Object.prototype.hasOwnProperty.call(json.dependencies, name)) {
        delete json.dependencies[name];
        editedTheFile = true;
      }
    });
  }
  if (json.devDependencies) {
    names.forEach((name) => {
      if (Object.prototype.hasOwnProperty.call(json.devDependencies, name)) {
        delete json.devDependencies[name];
        editedTheFile = true;
      }
    });
  }

  if (editedTheFile) {
    // recreate the file
    fs.writeFileSync(filePath, '', 'utf8');

    const newFileContents = JSON.stringify(json, null, 2);
    const newFileLines = newFileContents.split(/\r?\n/);
    newFileLines.forEach((line) => {
      fs.appendFileSync(filePath, line + os.EOL, 'utf8');
    });
  }
}

function removeDependencyFromEnvironmentYml(filePath: string, names: string[]) {
  const fileContents = fs.readFileSync(filePath, 'utf8');

  const fileLines = fileContents.split(/\r?\n/);
  const lastLineIndex = fileLines.length - 1;

  // recreate the file
  fs.writeFileSync(filePath, '', 'utf8');

  // read each line and remove any of the named dependencies
  fileLines.forEach((line, index) => {
    let write = true;

    names.forEach((name) => {
      write = write && !new RegExp(`^ *- ${name}`).test(line);
    });

    if (write) {
      // append an EOL if not the last line
      if (index < lastLineIndex) {
        fs.appendFileSync(filePath, line + os.EOL, 'utf8');
      } else {
        fs.appendFileSync(filePath, line, 'utf8');
      }
    }
  });
}

function removeDependencyFromRequirementsTxt(
  filePath: string,
  names: string[]
) {
  const fileContents = fs.readFileSync(filePath, 'utf8');

  const fileLines = fileContents.split(/\r?\n/);
  const lastLineIndex = fileLines.length - 1;

  // recreate the file
  fs.writeFileSync(filePath, '', 'utf8');

  // read each line and remove any of the named dependencies
  fileLines.forEach((line, index) => {
    let write = true;

    names.forEach((name) => {
      write = write && !new RegExp(`^ *${name}`).test(line);
    });

    if (write) {
      // append an EOL if not the last line
      if (index < lastLineIndex) {
        fs.appendFileSync(filePath, line + os.EOL, 'utf8');
      } else {
        fs.appendFileSync(filePath, line, 'utf8');
      }
    }
  });
}

function removeScriptReferences(removableOption: TemplateRemovableOption) {
  if (removableOption.scriptNames && removableOption.scriptNames.length > 0) {
    editEachPackageScripts(CURR_DIR, removableOption.scriptNames);
  }
}

function editEachPackageScripts(folderPath: string, names: string[]) {
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    if (CONTENT_TO_SKIP_CONFIG_EDITS.includes(file)) return;

    const filePath = path.join(folderPath, file);
    const fileStats = fs.statSync(filePath);
    if (fileStats.isFile() && file === 'package.json') {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(fileContents);

      let editedTheFile = false;
      if (json.scripts) {
        names.forEach((name) => {
          if (Object.prototype.hasOwnProperty.call(json.scripts, name)) {
            delete json.scripts[name];
            editedTheFile = true;
          }
        });
      }

      if (editedTheFile) {
        // recreate the file
        fs.writeFileSync(filePath, '', 'utf8');

        const newFileContents = JSON.stringify(json, null, 2);
        const newFileLines = newFileContents.split(/\r?\n/);
        newFileLines.forEach((line) => {
          fs.appendFileSync(filePath, line + os.EOL, 'utf8');
        });
      }
    } else if (fileStats.isDirectory()) {
      // recursively go through each directory
      editEachPackageScripts(filePath, names);
    }
  });
}

function saveOptionAsRemoved(
  templateConfig: IPinkyringConfig,
  removableOption: TemplateRemovableOption
) {
  removableOption.removed = true;

  // recreate the file
  const pinkyringFilePath = path.join(CURR_DIR, '.pinkyring.json');
  fs.writeFileSync(pinkyringFilePath, '', 'utf8');

  const newFileContents = JSON.stringify(templateConfig, null, 2);
  const newFileLines = newFileContents.split(/\r?\n/);
  newFileLines.forEach((line) => {
    fs.appendFileSync(pinkyringFilePath, line + os.EOL, 'utf8');
  });
}

function removeAllPinkyringHooks(templateConfig: IPinkyringConfig) {
  templateConfig.removableOptions.forEach((option) => {
    if (option.removed !== true) {
      if (option.contentPattern && option.contentPattern.length > 0) {
        removeHooksFromEachFile(CURR_DIR, option.contentPattern);
      }
    }
  });
}

function removeHooksFromEachFile(folderPath: string, contentPattern: string) {
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    if (CONTENT_TO_SKIP_LINE_EDITS.includes(file)) return;

    const filePath = path.join(folderPath, file);
    const fileStats = fs.statSync(filePath);
    if (fileStats.isFile() && isText(file)) {
      // read and edit file if necessary
      const fileContents = fs.readFileSync(filePath, 'utf8');
      if (fileContents.indexOf(contentPattern) !== -1) {
        const fileLines = fileContents.split(/\r?\n/);
        const lastLineIndex = fileLines.length - 1;

        // recreate the file
        fs.writeFileSync(filePath, '', 'utf8');

        // read each line and remove if the pattern matches
        fileLines.forEach((line, index) => {
          if (line.indexOf(contentPattern) === -1) {
            // append an EOL if not the last line
            if (index < lastLineIndex) {
              fs.appendFileSync(filePath, line + os.EOL, 'utf8');
            } else {
              fs.appendFileSync(filePath, line, 'utf8');
            }
          }
        });
      }
    } else if (fileStats.isDirectory()) {
      // recursively go through each directory
      removeHooksFromEachFile(filePath, contentPattern);
    }
  });
}

function lockPinkyringFile(templateConfig: IPinkyringConfig) {
  templateConfig.fileLocked = true;

  // recreate the file
  const pinkyringFilePath = path.join(CURR_DIR, '.pinkyring.json');
  fs.writeFileSync(pinkyringFilePath, '', 'utf8');

  const newFileContents = JSON.stringify(templateConfig, null, 2);
  const newFileLines = newFileContents.split(/\r?\n/);
  newFileLines.forEach((line) => {
    fs.appendFileSync(pinkyringFilePath, line + os.EOL, 'utf8');
  });
}
