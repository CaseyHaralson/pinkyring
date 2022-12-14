import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import rimraf from 'rimraf';
import os from 'os';
import {IPinkyringConfig, TemplateRemovableOption} from './IPinkyringConfig';
import inquirer, {Answers} from 'inquirer';

const CURR_DIR = process.cwd();

const CONTENT_TO_SKIP_LINE_EDITS = [
  '.pinkyring.json',
  'node_modules',
  'build',
  'package.lock.json',
  'package.json',
  'tsconfig.json',
  'tsconfig.tsbuildinfo',
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

      if (remove === 'PINKYRING COMMENTS') {
        confirmRemovePinkyringComments(templateConfig);
        return;
      }

      const removableOption = getRemovableOption(templateConfig, remove);
      removeGlobs(removableOption);
      removeContent(removableOption);
      removeTypescriptReferences(removableOption);
      removePackageReferences(removableOption);
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
      `All of the pinkyring template comments were removed from this project and the .pinkyring file was locked. No more edits can be made.`
    );
    return null;
  }

  return templateConfig;
}

function buildRemovalChoices(templateConfig: IPinkyringConfig) {
  //console.log(`Template config: ${JSON.stringify(templateConfig)}`);
  let choices: string[] = [];
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
      choices: [...removalChoices, 'Cancel', 'PINKYRING COMMENTS'],
    },
  ];
  return questions;
}

function confirmRemovePinkyringComments(templateConfig: IPinkyringConfig) {
  const question = [
    {
      name: 'remove',
      type: 'list',
      message:
        'This will remove all the pinkyring comments that allow you to remove pieces of the template. Are you sure?',
      choices: ['YES', 'NO'],
    },
  ];
  inquirer.prompt(question).then((answers: Answers) => {
    const remove = answers['remove'];
    if (remove === 'NO') {
      editProject();
    } else {
      removeAllPinkyringComments(templateConfig);
      lockPinkyringFile(templateConfig);
      console.log(
        chalk.green(
          `All the leftover pinkyring template comments were removed!`
        )
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
    if (!CONTENT_TO_SKIP_LINE_EDITS.includes(file)) {
      const filePath = path.join(folderPath, file);
      const fileStats = fs.statSync(filePath);
      if (fileStats.isFile()) {
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
    if (file === 'node_modules') return;

    const filePath = path.join(folderPath, file);
    const fileStats = fs.statSync(filePath);
    if (fileStats.isFile()) {
      if (file === 'tsconfig.json') {
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
      }
    } else if (fileStats.isDirectory()) {
      // recursively go through each directory
      editEachTsConfig(filePath, patterns);
    }
  });
}

function removePackageReferences(removableOption: TemplateRemovableOption) {
  if (removableOption.packageNames && removableOption.packageNames.length > 0) {
    editEachPackageConfig(CURR_DIR, removableOption.packageNames);
  }
}

function editEachPackageConfig(folderPath: string, names: string[]) {
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    if (file === 'node_modules') return;

    const filePath = path.join(folderPath, file);
    const fileStats = fs.statSync(filePath);
    if (fileStats.isFile()) {
      if (file === 'package.json') {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(fileContents);

        let editedTheFile = false;
        if (json.dependencies) {
          names.forEach((name) => {
            if (json.dependencies.hasOwnProperty(name)) {
              delete json.dependencies[name];
              editedTheFile = true;
            }
          });
        }
        if (json.devDependencies) {
          names.forEach((name) => {
            if (json.devDependencies.hasOwnProperty(name)) {
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
    } else if (fileStats.isDirectory()) {
      // recursively go through each directory
      editEachTsConfig(filePath, names);
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

function removeAllPinkyringComments(templateConfig: IPinkyringConfig) {
  templateConfig.removableOptions.forEach((option) => {
    if (option.removed !== true) {
      if (option.contentPattern && option.contentPattern.length > 0) {
        removeCommentsFromEachFile(CURR_DIR, option.contentPattern);
      }
    }
  });
}

function removeCommentsFromEachFile(
  folderPath: string,
  contentPattern: string
) {
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    if (!CONTENT_TO_SKIP_LINE_EDITS.includes(file)) {
      const filePath = path.join(folderPath, file);
      const fileStats = fs.statSync(filePath);
      if (fileStats.isFile()) {
        // read and edit file if necessary
        const fileContents = fs.readFileSync(filePath, 'utf8');
        if (fileContents.indexOf(contentPattern) !== -1) {
          const fileLines = fileContents.split(/\r?\n/);
          const lastLineIndex = fileLines.length - 1;

          // recreate the file
          fs.writeFileSync(filePath, '', 'utf8');

          // read each line and remove sections of the content pattern
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
        editEachFile(filePath, contentPattern);
      }
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
