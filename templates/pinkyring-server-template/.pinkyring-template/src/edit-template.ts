import chalk from "chalk";
import inquirer, { Answers } from "inquirer";

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

export function editTemplate(rootDir: string) {
  const questions = buildQuestions();
  inquirer.prompt(questions).then((answers: Answers) => {
    const action = answers["action"];
    console.log(chalk.green(`chosen action: ${action}`));
  });
}

function getPinkyringFilePath(rootDir: string) {

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
  ]
  // list of all choices
  // then get removed items from pinkyring file
  // edit list of choices

  return allChoices;
}