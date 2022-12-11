import fs from 'fs';
import path from 'path';
import {editTemplate} from './edit-template'
import {v4 as uuidv4} from 'uuid';

// create test project off template
// then run editTemplate

const templateRootPath = path.join(__dirname, '..', '..');
const newProjectName = 'pinkyring-server-template_' + uuidv4();
const newProjectRootPath = path.join(templateRootPath, '..', newProjectName);

function createNewProjectFromTemplate() {
  fs.mkdirSync(newProjectRootPath);
  createDirectoryContents(templateRootPath, newProjectRootPath);
  copyPinkyringFile();
}

function createDirectoryContents(
  templatePath: string,
  newProjectPath: string
) {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach((file) => {
    const origFilePath = path.join(templatePath, file);

    const fileStats = fs.statSync(origFilePath);
    if (fileStats.isFile()) {
      let fileContents = fs.readFileSync(origFilePath, "utf8");
      //fileContents = render(fileContents, templateData);
      const writePath = path.join(newProjectPath, file);
      fs.writeFileSync(writePath, fileContents, "utf8");
    } else if (fileStats.isDirectory()) {
      // don't copy the .pinkyring-template folder
      // and don't copy the .git folder
      // otherwise, copy the folder and all its contents
      if (file !== ".pinkyring-template" && file !== '.git') {
        fs.mkdirSync(path.join(newProjectPath, file));

        // recursively make new contents
        createDirectoryContents(
          path.join(templatePath, file),
          path.join(newProjectPath, file)
        );
      }
    }
  });
}

function copyPinkyringFile() {
  const filePath = path.join(templateRootPath, '.pinkyring-template', '.pinkyring');
  const fileContents = fs.readFileSync(filePath, "utf8");

  const newFilePath = path.join(newProjectRootPath, '.pinkyring');
  fs.writeFileSync(newFilePath, fileContents, "utf8");
}

createNewProjectFromTemplate();
editTemplate(newProjectRootPath);