"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewProject = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const template_1 = require("./template");
const CURR_DIR = process.cwd();
function createNewProject(newProjectName, templatePath, templateData) {
    const newProjectPath = path_1.default.join(CURR_DIR, newProjectName);
    if (fs_1.default.existsSync(newProjectPath)) {
        console.log(chalk_1.default.red(`Folder ${newProjectPath} already exists. Please delete it or use another project name.`));
        return false;
    }
    fs_1.default.mkdirSync(newProjectPath);
    createDirectoryContents(templatePath, newProjectName, templateData);
}
exports.createNewProject = createNewProject;
function createDirectoryContents(templatePath, newProjectPath, templateData) {
    const filesToCreate = fs_1.default.readdirSync(templatePath);
    filesToCreate.forEach((file) => {
        const origFilePath = path_1.default.join(templatePath, file);
        const fileStats = fs_1.default.statSync(origFilePath);
        if (fileStats.isFile()) {
            let fileContents = fs_1.default.readFileSync(origFilePath, "utf8");
            fileContents = (0, template_1.render)(fileContents, templateData);
            const writePath = path_1.default.join(CURR_DIR, newProjectPath, file);
            fs_1.default.writeFileSync(writePath, fileContents, "utf8");
        }
        else if (fileStats.isDirectory()) {
            fs_1.default.mkdirSync(path_1.default.join(CURR_DIR, newProjectPath, file));
            // recursively make new contents
            createDirectoryContents(path_1.default.join(templatePath, file), path_1.default.join(newProjectPath, file), templateData);
        }
    });
}
