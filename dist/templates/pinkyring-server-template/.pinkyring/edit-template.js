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
const QUESTIONS = [
    {
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: ["ACTION_NEW_PROJECT", "ACTION_EDIT_PROJECT"],
    },
];
function editTemplate() {
    inquirer_1.default.prompt(QUESTIONS).then((answers) => {
        const action = answers["action"];
        console.log(chalk_1.default.green(`chosen action from project script: ${action}`));
    });
}
exports.editTemplate = editTemplate;
