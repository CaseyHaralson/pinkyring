import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import rimraf from 'rimraf';
import os from 'os';
import {
  TemplateConfigInterface,
  TemplateRemovableOption,
} from './pinkyring-config-interface';
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
      if (remove === 'Cancel') return;

      const removableOption = getRemovableOption(templateConfig, remove);
      removeGlobs(removableOption);
      removeContent(removableOption);
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

  const templateConfig: TemplateConfigInterface = JSON.parse(
    fs.readFileSync(pinkyringFilePath, 'utf8')
  );
  return templateConfig;
}

function buildRemovalChoices(templateConfig: TemplateConfigInterface) {
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
      choices: [...removalChoices, 'Cancel'],
    },
  ];
  return questions;
}

function getRemovableOption(
  templateConfig: TemplateConfigInterface,
  remove: string
) {
  let removableOption: TemplateRemovableOption = null;
  templateConfig.removableOptions.forEach((option) => {
    if (option.label === remove) {
      removableOption = option;
      return removableOption;
    }
  });
  return removableOption;
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
