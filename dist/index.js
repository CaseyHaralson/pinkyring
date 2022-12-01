"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const inquirer_1 = __importDefault(require("inquirer"));
const project_helper_1 = require("./project-helper");
const path_1 = __importDefault(require("path"));
const CHOICES = fs_1.default.readdirSync(path_1.default.join(__dirname, "..", "templates"));
const QUESTIONS = [
    {
        name: "project-choice",
        type: "list",
        message: "What project template would you like to generate?",
        choices: CHOICES,
        when: () => {
            if (CHOICES.length === 1)
                return false;
            return true;
        },
    },
    {
        name: "project-name",
        type: "input",
        message: "Project name:",
        validate: function (input) {
            if (/^([A-Za-z\-\_\d])+$/.test(input))
                return true;
            else
                return "Project name may only include letters, numbers, underscores and dashes.";
        },
    },
];
inquirer_1.default.prompt(QUESTIONS).then((answers) => {
    //console.log(answers);
    const projectChoice = answers["project-choice"] ?? CHOICES[0];
    const projectName = answers["project-name"];
    const templatePath = path_1.default.join(__dirname, "..", "templates", projectChoice);
    const templateData = {
        projectName: projectName,
    };
    (0, project_helper_1.createNewProject)(projectName, templatePath, templateData);
});
