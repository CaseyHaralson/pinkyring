import fs from "fs";
import inquirer, { Answers } from "inquirer";
import { createNewProject } from "./project-helper";
import path from "path";
import { TemplateData } from "./template";

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
