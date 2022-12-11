import chalk from "chalk";
import inquirer, { Answers } from "inquirer";

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
    choices: ['ACTION_NEW_PROJECT', 'ACTION_EDIT_PROJECT'],
  },
];

inquirer.prompt(QUESTIONS).then((answers: Answers) => {
  const action = answers["action"];
  console.log(`chosen action: ${action}`);
});