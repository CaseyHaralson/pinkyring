"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const edit_project_helper_1 = require("./edit-project-helper");
const new_project_helper_1 = require("./new-project-helper");
const ACTION_NEW_PROJECT = "Create new project";
const ACTION_EDIT_PROJECT = "Edit existing project";
const QUESTIONS = [
    {
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [ACTION_NEW_PROJECT, ACTION_EDIT_PROJECT],
    },
];
inquirer_1.default.prompt(QUESTIONS).then((answers) => {
    const action = answers["action"];
    if (action === ACTION_NEW_PROJECT) {
        (0, new_project_helper_1.promptForNewProject)();
    }
    else if (action === ACTION_EDIT_PROJECT) {
        (0, edit_project_helper_1.findTemplateAndRunEdit)();
    }
});
