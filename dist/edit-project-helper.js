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
const os_1 = __importDefault(require("os"));
const inquirer_1 = __importDefault(require("inquirer"));
const CURR_DIR = process.cwd();
const CONTENT_TO_SKIP_LINE_EDITS = [
    '.pinkyring.json',
    'node_modules',
    'build',
    'package.lock.json',
    'package.json',
    'tsconfig.json',
    'tsconfig.tsbuildinfo',
];
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
            removeContent(removableOption);
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
function removeContent(removableOption) {
    // for each file in folder and subfolder
    // read content and look for pattern
    // when find start, stop writing content
    // then when find end, start writing content again
    if (removableOption.contentPattern &&
        removableOption.contentPattern.length > 0) {
        editEachFile(CURR_DIR, removableOption.contentPattern);
    }
}
function editEachFile(folderPath, contentPattern) {
    const files = fs_1.default.readdirSync(folderPath);
    files.forEach((file) => {
        if (!CONTENT_TO_SKIP_LINE_EDITS.includes(file)) {
            const filePath = path_1.default.join(folderPath, file);
            const fileStats = fs_1.default.statSync(filePath);
            if (fileStats.isFile()) {
                // read and edit file if necessary
                const fileContents = fs_1.default.readFileSync(filePath, 'utf8');
                if (fileContents.indexOf(contentPattern) !== -1) {
                    const fileLines = fileContents.split(/\r?\n/);
                    const lastLineIndex = fileLines.length - 1;
                    // recreate the file
                    fs_1.default.writeFileSync(filePath, '', 'utf8');
                    // read each line and remove sections of the content pattern
                    let write = true;
                    fileLines.forEach((line, index) => {
                        if (write && line.indexOf(contentPattern) > -1) {
                            write = false;
                        }
                        else if (write) {
                            // append an EOL if not the last line
                            if (index < lastLineIndex) {
                                fs_1.default.appendFileSync(filePath, line + os_1.default.EOL, 'utf8');
                            }
                            else {
                                fs_1.default.appendFileSync(filePath, line, 'utf8');
                            }
                        }
                        else if (line.indexOf(contentPattern + '.end') > -1) {
                            write = true;
                        }
                    });
                }
            }
            else if (fileStats.isDirectory()) {
                // recursively go through each directory
                editEachFile(filePath, contentPattern);
            }
        }
    });
}
