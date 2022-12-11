"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editTemplate = void 0;
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
// function test() {
//   console.log(`process cwd: ${process.cwd()}`);
//   console.log(`current dir: ${__dirname}`);
//   console.log(chalk.green(`test from inside the template`));
// }
// test();
// const QUESTIONS = [
//   {
//     name: "action",
//     type: "list",
//     message: "What would you like to remove?",
//     choices: ["ACTION_NEW_PROJECT", "ACTION_EDIT_PROJECT"],
//   },
// ];
function editTemplate(rootDir) {
    const questions = buildQuestions();
    inquirer_1.default.prompt(questions).then((answers) => {
        const action = answers["action"];
        console.log(chalk_1.default.green(`chosen action: ${action}`));
    });
}
exports.editTemplate = editTemplate;
function getPinkyringFilePath(rootDir) {
}
function buildQuestions() {
    const questions = [
        {
            name: "action",
            type: "list",
            message: "What would you like to remove?",
            choices: buildRemovalChoices(),
        },
    ];
    return questions;
}
function buildRemovalChoices() {
    const allChoices = [
        "SERVERLESS",
        "GITHUB WORKFLOWS",
        "GRAPHQL",
        "REST ENDPOINTS",
        "CRON JOBS",
        "EVENTS"
    ];
    // list of all choices
    // then get removed items from pinkyring file
    // edit list of choices
    return allChoices;
}
