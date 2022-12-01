import fs from "fs";
import path from "path";
import chalk from "chalk";
import { render, TemplateData } from "./template";

const CURR_DIR = process.cwd();

export function createNewProject(
  newProjectName: string,
  templatePath: string,
  templateData: TemplateData
) {
  const newProjectPath = path.join(CURR_DIR, newProjectName);

  if (fs.existsSync(newProjectPath)) {
    console.log(
      chalk.red(
        `Folder ${newProjectPath} already exists. Please delete it or use another project name.`
      )
    );
    return false;
  }

  fs.mkdirSync(newProjectPath);
  createDirectoryContents(templatePath, newProjectName, templateData);
}

function createDirectoryContents(
  templatePath: string,
  newProjectPath: string,
  templateData: TemplateData
) {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach((file) => {
    const origFilePath = path.join(templatePath, file);

    const fileStats = fs.statSync(origFilePath);
    if (fileStats.isFile()) {
      let fileContents = fs.readFileSync(origFilePath, "utf8");
      fileContents = render(fileContents, templateData);
      const writePath = path.join(CURR_DIR, newProjectPath, file);
      fs.writeFileSync(writePath, fileContents, "utf8");
    } else if (fileStats.isDirectory()) {
      fs.mkdirSync(path.join(CURR_DIR, newProjectPath, file));

      // recursively make new contents
      createDirectoryContents(
        path.join(templatePath, file),
        path.join(newProjectPath, file),
        templateData
      );
    }
  });
}
