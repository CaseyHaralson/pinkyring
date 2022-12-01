import fs from "fs";
import path from "path";
import chalk from "chalk";
import { render, TemplateData } from "./template-helper";
import inquirer, { Answers } from "inquirer";

const CURR_DIR = process.cwd();
const CHOICES = fs.readdirSync(path.join(__dirname, "..", "templates"));
const QUESTIONS = [
  {
    name: "project-choice",
    type: "list",
    message: "What project template would you like to generate?",
    choices: CHOICES,
    when: () => {
      if (CHOICES.length === 1) return false;
      return true;
    },
  },
  {
    name: "project-name",
    type: "input",
    message: "Project name:",
    validate: function (input: string) {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else
        return "Project name may only include letters, numbers, underscores and dashes.";
    },
  },
];

export function promptForNewProject() {
  inquirer.prompt(QUESTIONS).then((answers: Answers) => {
    //console.log(answers);

    const projectChoice = answers["project-choice"] ?? CHOICES[0];
    const projectName = answers["project-name"];
    const templatePath = path.join(__dirname, "..", "templates", projectChoice);

    const templateData = {
      projectName: projectName,
    } as TemplateData;

    createNewProject(projectName, templatePath, templateData);
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
      let fileContents = fs.readFileSync(origFilePath, "utf8");
      fileContents = render(fileContents, templateData);
      const writePath = path.join(CURR_DIR, newProjectPath, file);
      fs.writeFileSync(writePath, fileContents, "utf8");
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
