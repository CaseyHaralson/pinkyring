import inquirer, {Answers} from 'inquirer';
import {editProject} from './edit-project-helper';
import {newProject} from './new-project-helper';

const ACTION_NEW_PROJECT = 'Create new project';
const ACTION_EDIT_PROJECT = 'Edit existing project';

const QUESTIONS = [
  {
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [ACTION_NEW_PROJECT, ACTION_EDIT_PROJECT],
  },
];

inquirer.prompt(QUESTIONS).then((answers: Answers) => {
  const action = answers['action'];
  if (action === ACTION_NEW_PROJECT) {
    newProject();
  } else if (action === ACTION_EDIT_PROJECT) {
    editProject();
  }
});
