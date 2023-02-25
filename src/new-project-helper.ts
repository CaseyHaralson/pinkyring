import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import os from 'os';
import {render, TemplateData} from './template-helper';
import inquirer, {Answers} from 'inquirer';
import childProcess from 'child_process';
import {ITemplatesConfig} from './ITemplatesConfig';
import gitly from 'gitly';

const STARTING_VERSION_NUMBER = '0.1.0';

const CURR_DIR = process.cwd();
const TEMPLATES: ITemplatesConfig = JSON.parse(
  fs.readFileSync(path.join(CURR_DIR, './templates.json'), 'utf8')
);
const CHOICES = TEMPLATES.options.map((o) => o.name);
const QUESTIONS = [
  {
    name: 'template-choice',
    type: 'list',
    message: 'What project template would you like to use?',
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
      if (/^([A-Za-z\-_\d])+$/.test(input)) return true;
      else
        return 'Project name may only include letters, numbers, underscores and dashes.';
    },
  },
  // TODO: if project-name like 'pinkyring' need to ask if they are sure
];

export function newProject() {
  inquirer.prompt(QUESTIONS).then((answers: Answers) => {
    //console.log(answers);

    const templateChoice = answers['template-choice'] ?? CHOICES[0];
    const projectName = answers['project-name'];
    const templatePath = path.join(
      __dirname,
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
    if (newProjectCreated) console.log(chalk.green('New project created!'));
  });
}

async function cloneTemplate(repo: string, destinationPath: string) {
  if (fs.existsSync(destinationPath)) {
    console.log(
      chalk.red(
        `Folder ${destinationPath} already exists. Please delete it or use another project name.`
      )
    );
    return false;
  }

  await gitly(repo, destinationPath, null);
  return true;
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
  runPrettierIfNeeded(newProjectName);
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

      // if the file is a package.json file, reset the version if needed
      if (file === 'package.json') {
        fileContents = resetVersionNumber(fileContents);
      }

      const writePath = path.join(CURR_DIR, newProjectPath, file);
      fs.writeFileSync(writePath, fileContents, 'utf8');
    } else if (fileStats.isDirectory()) {
      fs.mkdirSync(path.join(CURR_DIR, newProjectPath, file));

      // recursively make new contents
      createDirectoryContents(
        path.join(templatePath, file),
        path.join(newProjectPath, file),
        templateData
      );
    }
  });
}

function resetVersionNumber(packageJsonFileContents: string) {
  const json = JSON.parse(packageJsonFileContents);
  if (Object.prototype.hasOwnProperty.call(json, 'version')) {
    // set the version to the starting version number
    json['version'] = STARTING_VERSION_NUMBER;

    // return the new file contents as a string
    let newFileContents = JSON.stringify(json, null, 2);
    newFileContents = newFileContents.replaceAll(/\r?\n/g, os.EOL);
    return newFileContents;
  } else return packageJsonFileContents;
}

function runPrettierIfNeeded(newProjectName: string) {
  const prettierConfigFilePath = path.join(
    CURR_DIR,
    newProjectName,
    '.prettierrc.json'
  );
  if (fs.existsSync(prettierConfigFilePath)) {
    childProcess.execSync(`cd ${newProjectName} && npm run prettier`);
  }
}
