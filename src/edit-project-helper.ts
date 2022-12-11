import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
//import {editTemplatePrompt} from './template-options/pinkyring-server-template/edit-template';
//import {editTemplatePrompt} from '@server-template/edit-template';
import {editTemplatePrompt} from '../templates/pinkyring-server-template/.pinkyring/edit-template';

// find the .pinkyring file
// read the template name
// go to the template
// and run the options

/*


dist

src
  template-editors
    class of TemplateEditor implements ITemplateEditor
      - editTemplatePrompt
  ITemplateEditor

templates
  neat-project


comments:
files:


*/

const CURR_DIR = process.cwd();

export function findTemplateAndRunEdit() {
  const templateName = findTemplateName();
  if (templateName) {
    // go to folder
    // run ts-node edit-template.ts file?
    runTemplateEditFile(templateName);
  }
}

function findTemplateName() {
  const pinkyringFilePath = path.join(CURR_DIR, '.pinkyring');
  if (!fs.existsSync(pinkyringFilePath)) {
    console.log(
      chalk.red(
        `The .pinkyring file couldn't be found. This command needs to be run from inside a project that was created with pinkyring.`
      )
    );
    return null;
  }

  let templateName: string = null;

  const pinkyringContents = fs.readFileSync(pinkyringFilePath, 'utf8');
  const lines = pinkyringContents.split(/\r?\n/);
  lines.forEach((line) => {
    if (line.startsWith('TEMPLATE=')) {
      templateName = line.replace(`TEMPLATE='`, '').replace(`'`, '');
    }
  });

  return templateName;
}

function runTemplateEditFile(templateName: string) {
  // const editFile = path.join(
  //   __dirname,
  //   "..",
  //   "templates",
  //   templateName,
  //   ".pinkyring",
  //   "edit-template.ts"
  // );

  // if (fs.existsSync(editFile)) {
  //   shell.exec(`npx ts-node ${editFile}`);
  // }
  editTemplatePrompt();
}
