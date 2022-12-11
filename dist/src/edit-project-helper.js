"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTemplateAndRunEdit = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const edit_template_1 = require("../templates/pinkyring-server-template/.pinkyring/edit-template");
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
function findTemplateAndRunEdit() {
    const templateName = findTemplateName();
    if (templateName) {
        // go to folder
        // run ts-node edit-template.ts file?
        runTemplateEditFile(templateName);
    }
}
exports.findTemplateAndRunEdit = findTemplateAndRunEdit;
function findTemplateName() {
    const pinkyringFilePath = path_1.default.join(CURR_DIR, '.pinkyring');
    if (!fs_1.default.existsSync(pinkyringFilePath)) {
        console.log(chalk_1.default.red(`The .pinkyring file couldn't be found. This command needs to be run from inside a project that was created with pinkyring.`));
        return null;
    }
    let templateName = null;
    const pinkyringContents = fs_1.default.readFileSync(pinkyringFilePath, 'utf8');
    const lines = pinkyringContents.split(/\r?\n/);
    lines.forEach((line) => {
        if (line.startsWith('TEMPLATE=')) {
            templateName = line.replace(`TEMPLATE='`, '').replace(`'`, '');
        }
    });
    return templateName;
}
function runTemplateEditFile(templateName) {
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
    (0, edit_template_1.editTemplate)();
}
