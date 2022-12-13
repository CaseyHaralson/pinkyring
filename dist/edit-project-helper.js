"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editProject = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const rimraf_1 = __importDefault(require("rimraf"));
const inquirer_1 = __importDefault(require("inquirer"));
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
function editProject() {
    const templateConfig = readPinkyringFile();
    if (templateConfig) {
        const removalChoices = buildRemovalChoices(templateConfig);
        const question = buildRemovalQuestion(removalChoices);
        inquirer_1.default.prompt(question).then((answers) => {
            const remove = answers['remove'];
            if (remove === 'Cancel')
                return;
            const removableOption = getRemovableOption(templateConfig, remove);
            removeGlobs(removableOption);
        });
    }
}
exports.editProject = editProject;
function readPinkyringFile() {
    const pinkyringFilePath = path_1.default.join(CURR_DIR, '.pinkyring.json');
    if (!fs_1.default.existsSync(pinkyringFilePath)) {
        console.log(chalk_1.default.red(`The .pinkyring file couldn't be found. This command needs to be run from inside a project that was created with pinkyring.`));
        return null;
    }
    const templateConfig = JSON.parse(fs_1.default.readFileSync(pinkyringFilePath, 'utf8'));
    return templateConfig;
}
function buildRemovalChoices(templateConfig) {
    //console.log(`Template config: ${JSON.stringify(templateConfig)}`);
    let choices = [];
    templateConfig.removableOptions.forEach((option) => {
        if (option.removed === null ||
            option.removed === undefined ||
            option.removed === false) {
            choices.push(option.label);
        }
    });
    return choices;
}
function buildRemovalQuestion(removalChoices) {
    const questions = [
        {
            name: 'remove',
            type: 'list',
            message: 'What would you like to remove?',
            choices: [...removalChoices, 'Cancel'],
        },
    ];
    return questions;
}
function getRemovableOption(templateConfig, remove) {
    let removableOption = null;
    templateConfig.removableOptions.forEach((option) => {
        if (option.label === remove) {
            removableOption = option;
            return removableOption;
        }
    });
    return removableOption;
}
function removeGlobs(removableOption) {
    if (removableOption.globPatterns && removableOption.globPatterns.length > 0) {
        removableOption.globPatterns.forEach((pattern) => {
            rimraf_1.default.sync(pattern);
        });
    }
}
// export function findTemplateAndRunEdit() {
//   const templateName = findTemplateName();
//   if (templateName) {
//     // go to folder
//     // run ts-node edit-template.ts file?
//     runTemplateEditFile(templateName);
//   }
// }
// function findTemplateName() {
//   const pinkyringFilePath = path.join(CURR_DIR, '.pinkyring');
//   if (!fs.existsSync(pinkyringFilePath)) {
//     console.log(
//       chalk.red(
//         `The .pinkyring file couldn't be found. This command needs to be run from inside a project that was created with pinkyring.`
//       )
//     );
//     return null;
//   }
//   let templateName: string = null;
//   const pinkyringContents = fs.readFileSync(pinkyringFilePath, 'utf8');
//   const lines = pinkyringContents.split(/\r?\n/);
//   lines.forEach((line) => {
//     if (line.startsWith('TEMPLATE=')) {
//       templateName = line.replace(`TEMPLATE=`, '');
//     }
//   });
//   return templateName;
// }
// function runTemplateEditFile(templateName: string) {
//   // const editFile = path.join(
//   //   __dirname,
//   //   "..",
//   //   "templates",
//   //   templateName,
//   //   ".pinkyring",
//   //   "edit-template.ts"
//   // );
//   // if (fs.existsSync(editFile)) {
//   //   shell.exec(`npx ts-node ${editFile}`);
//   // }
//   editTemplate(CURR_DIR);
// }
