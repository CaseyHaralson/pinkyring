import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import {render, TemplateData} from './template-helper';
import inquirer, {Answers} from 'inquirer';

const CURR_DIR = process.cwd();
const CHOICES = fs.readdirSync(path.join(__dirname, '..', '..', 'templates'));
const QUESTIONS = [
  {
    name: 'template-choice',
    type: 'list',
    message: 'What project template would you like to generate?',
    choices: CHOICES,
    // when: () => {
    //   if (CHOICES.length === 1) return false;
    //   return true;
    // },
  },
  {
    name: 'project-name',
    type: 'input',
    message: 'Project name:',
    validate: function (input: string) {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else
        return 'Project name may only include letters, numbers, underscores and dashes.';
    },
  },
];

export function promptForNewProject() {
  inquirer.prompt(QUESTIONS).then((answers: Answers) => {
    //console.log(answers);

    const templateChoice = answers['template-choice'] ?? CHOICES[0];
    const projectName = answers['project-name'];
    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      'templates',
      templateChoice
    );

    const templateData = {
      projectName: projectName,
      selectedTemplate: templateChoice,
    } as TemplateData;

    const newProjectCreated = createNewProject(
      projectName,
      templatePath,
      templateData
    );
    if (newProjectCreated) console.log(chalk.green('New project created.'));
  });
}

function createNewProject(
  newProjectName: string,
  templatePath: string,
  templateData: TemplateData
) {
  const newProjectPath = path.join(CURR_DIR, newProjectName);

  if (fs.existsSync(newProjectPath)) {
    console.log(
      chalk.red(
        `Folder ${newProjectPath} already exists. Please delete it or use another project name.`
      )
    );
    return false;
  }

  fs.mkdirSync(newProjectPath);
  createDirectoryContents(templatePath, newProjectName, templateData);
  //createPinkyringFile(newProjectPath, templateData);
  copyPinkyringFile(templatePath, newProjectPath);

  return true;
}

function createDirectoryContents(
  templatePath: string,
  newProjectPath: string,
  templateData: TemplateData
) {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach((file) => {
    const origFilePath = path.join(templatePath, file);

    const fileStats = fs.statSync(origFilePath);
    if (fileStats.isFile()) {
      let fileContents = fs.readFileSync(origFilePath, 'utf8');
      fileContents = render(fileContents, templateData);
      const writePath = path.join(CURR_DIR, newProjectPath, file);
      fs.writeFileSync(writePath, fileContents, 'utf8');
    } else if (fileStats.isDirectory()) {
      // don't copy the .pinkyring-template folder
      // otherwise, copy the folder and all its contents
      if (file !== '.pinkyring-template') {
        fs.mkdirSync(path.join(CURR_DIR, newProjectPath, file));

        // recursively make new contents
        createDirectoryContents(
          path.join(templatePath, file),
          path.join(newProjectPath, file),
          templateData
        );
      }
    }
  });
}

function createPinkyringFile(
  newProjectPath: string,
  templateData: TemplateData
) {
  const filePath = path.join(newProjectPath, '.pinkyring');
  fs.writeFileSync(filePath, `TEMPLATE='${templateData.selectedTemplate}'`);
}

function copyPinkyringFile(templatePath: string, newProjectPath: string) {
  const filePath = path.join(templatePath, '.pinkyring-template', '.pinkyring');
  const fileContents = fs.readFileSync(filePath, 'utf8');

  const newFilePath = path.join(newProjectPath, '.pinkyring');
  fs.writeFileSync(newFilePath, fileContents, 'utf8');
}
