"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptForNewProject = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const template_helper_1 = require("./template-helper");
const inquirer_1 = __importDefault(require("inquirer"));
const CURR_DIR = process.cwd();
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
function promptForNewProject() {
    inquirer_1.default.prompt(QUESTIONS).then((answers) => {
        //console.log(answers);
        const projectChoice = answers["project-choice"] ?? CHOICES[0];
        const projectName = answers["project-name"];
        const templatePath = path_1.default.join(__dirname, "..", "templates", projectChoice);
        const templateData = {
            projectName: projectName,
        };
        createNewProject(projectName, templatePath, templateData);
    });
}
exports.promptForNewProject = promptForNewProject;
function createNewProject(newProjectName, templatePath, templateData) {
    const newProjectPath = path_1.default.join(CURR_DIR, newProjectName);
    if (fs_1.default.existsSync(newProjectPath)) {
        console.log(chalk_1.default.red(`Folder ${newProjectPath} already exists. Please delete it or use another project name.`));
        return false;
    }
    fs_1.default.mkdirSync(newProjectPath);
    createDirectoryContents(templatePath, newProjectName, templateData);
}
function createDirectoryContents(templatePath, newProjectPath, templateData) {
    const filesToCreate = fs_1.default.readdirSync(templatePath);
    filesToCreate.forEach((file) => {
        const origFilePath = path_1.default.join(templatePath, file);
        const fileStats = fs_1.default.statSync(origFilePath);
        if (fileStats.isFile()) {
            let fileContents = fs_1.default.readFileSync(origFilePath, "utf8");
            fileContents = (0, template_helper_1.render)(fileContents, templateData);
            const writePath = path_1.default.join(CURR_DIR, newProjectPath, file);
            fs_1.default.writeFileSync(writePath, fileContents, "utf8");
        }
        else if (fileStats.isDirectory()) {
            fs_1.default.mkdirSync(path_1.default.join(CURR_DIR, newProjectPath, file));
            // recursively make new contents
            createDirectoryContents(path_1.default.join(templatePath, file), path_1.default.join(newProjectPath, file), templateData);
        }
    });
}
