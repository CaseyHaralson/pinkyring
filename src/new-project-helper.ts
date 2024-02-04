import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import os from 'os';
import {render} from './template-helper';
import inquirer, {Answers} from 'inquirer';
import childProcess from 'child_process';
import {ITemplatesConfig} from './ITemplatesConfig';
import gitly from 'gitly';
import {isText} from 'istextorbinary';

const STARTING_VERSION_NUMBER = '0.1.0';

const CURR_DIR = process.cwd();
const TEMPLATES: ITemplatesConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'templates.json'), 'utf8')
);
const TEMPLATE_CHOICES = TEMPLATES.options.map((o) => o.name);
const QUESTIONS = [
  {
    name: 'template-choice',
    type: 'list',
    message: 'What project template would you like to use?',
    choices: TEMPLATE_CHOICES,
    when: (answers: Answers) => {
      if (answers['initial-template-repo'] !== null) return false;
      return true;
    },
  },
  {
    name: 'template-repo',
    type: 'input',
    message: 'Template repo (like "owner/repo-name"):',
    when: (answers: Answers) => {
      // the last template choice is always entering a repo url
      // so only ask this question if that was the selected answer
      if (
        answers['template-choice'] ===
        TEMPLATE_CHOICES[TEMPLATE_CHOICES.length - 1]
      )
        return true;
      return false;
    },
    validate: function (input: string) {
      const lastSlashIndex = input.indexOf('/');
      if (lastSlashIndex < 1 || lastSlashIndex === input.length - 1)
        return 'Repo must end in format: owner/repo-name';
      else return true;
    },
  },
  {
    name: 'new-project-name',
    type: 'input',
    message: 'New project name:',
    validate: function (input: string) {
      if (/^([A-Za-z\-_\d])+$/.test(input)) return true;
      else
        return 'Project name may only include letters, numbers, underscores and dashes.';
    },
  },
];

export function newProject(initialTemplateRepo: string) {
  const initialAnswers: Answers = {
    'initial-template-repo': initialTemplateRepo,
  };
  inquirer.prompt(QUESTIONS, initialAnswers).then(async (answers: Answers) => {
    //console.log(answers);
    const repo: string =
      initialTemplateRepo ??
      answers['template-repo'] ??
      TEMPLATES.options.find((o) => o.name === answers['template-choice'])
        ?.repo;
    const templateName = extractTemplateNameFromRepo(repo);
    const newProjectName = answers['new-project-name'];
    const newProjectPath = path.join(CURR_DIR, newProjectName);

    const templateExtracted = await cloneTemplate(repo, newProjectPath);
    if (templateExtracted) {
      updateTemplateContents(newProjectPath, templateName, newProjectName);
      runPrettierIfNeeded(newProjectPath);
      console.log(chalk.green('New project created!'));
    }
  });
}

function extractTemplateNameFromRepo(repo: string) {
  // repo could look like "owner/repo#version"
  const lastSlashIndex = repo.lastIndexOf('/');
  const lastHashIndex = repo.lastIndexOf('#');
  let templateName = repo.substring(lastSlashIndex + 1);
  if (lastHashIndex > -1)
    templateName = templateName.substring(0, lastHashIndex);
  return templateName;
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

  await gitly(repo, destinationPath, {});

  if (!fs.existsSync(destinationPath)) {
    console.log(
      chalk.red(
        `There was a problem creating the project. Check the repo spelling and make sure the repo is accessible.`
      )
    );
    return false;
  }

  return true;
}

function updateTemplateContents(
  directoryPath: string,
  templateName: string,
  newProjectName: string
) {
  const files = fs.readdirSync(directoryPath);
  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const fileStats = fs.statSync(filePath);
    if (fileStats.isFile() && isText(file)) {
      let fileContents = fs.readFileSync(filePath, 'utf8');
      fileContents = render(fileContents, templateName, newProjectName);

      // if the file is a package.json file, reset the version if needed
      if (file === 'package.json') {
        fileContents = resetVersionNumber(fileContents);
      }

      fs.writeFileSync(filePath, fileContents, 'utf8');
    } else if (fileStats.isDirectory()) {
      // recursively update template contents
      updateTemplateContents(
        path.join(directoryPath, file),
        templateName,
        newProjectName
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

function runPrettierIfNeeded(newProjectPath: string) {
  const prettierConfigFilePath = path.join(newProjectPath, '.prettierrc.json');
  if (fs.existsSync(prettierConfigFilePath)) {
    childProcess.execSync(`cd ${newProjectPath} && npx prettier --write .`);
  }
}
