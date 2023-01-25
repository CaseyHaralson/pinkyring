const fs = require('fs');
const path = require('path');
const os = require('os');

const packagePath = path.join(__dirname, 'packages');

// get the version from the project package.json
function getProjectVersion() {
  const projectPackageJsonFilePath = path.join(__dirname, 'package.json');
  if (fs.existsSync(projectPackageJsonFilePath)) {
    const fileContents = fs.readFileSync(projectPackageJsonFilePath, 'utf8');
    const json = JSON.parse(fileContents);
    if (Object.prototype.hasOwnProperty.call(json, 'version')) {
      const version = json['version'];
      return version;
    } else {
      throw new Error(
        `The project package.json file doesn't have a version property.`
      );
    }
  } else {
    throw new Error(`The project package.json file couldn't be found.`);
  }
}

// add the version in all sub packages with the passed in version
// if the sub package doesn't already have a version set
function copyVersionToAllSubPackages(folderPath, version) {
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    if (file === 'node_modules') return;

    const filePath = path.join(folderPath, file);
    const fileStats = fs.statSync(filePath);
    if (fileStats.isFile()) {
      if (file === 'package.json') {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(fileContents);

        if (!Object.prototype.hasOwnProperty.call(json, 'version')) {
          json['version'] = version;

          // recreate the file
          fs.writeFileSync(filePath, '', 'utf8');

          const newFileContents = JSON.stringify(json, null, 2);
          const newFileLines = newFileContents.split(/\r?\n/);
          newFileLines.forEach((line) => {
            fs.appendFileSync(filePath, line + os.EOL, 'utf8');
          });
        }
      }
    } else if (fileStats.isDirectory()) {
      // recursively go through each directory
      copyVersionToAllSubPackages(filePath, version);
    }
  });
}

const projectVersion = getProjectVersion();
copyVersionToAllSubPackages(packagePath, projectVersion);
