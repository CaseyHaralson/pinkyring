const fs = require('fs');
const path = require('path');
const os = require('os');

// an index file at the root of each workspace package
// is pretty much essential to making
// intellisense auto-imports work

// this file will create the index.ts file
// if it doesn't already exist
// so, before running this file, clear any index.ts files
// that you will want recreated

// package paths to ignore
const PACKAGE_IGNORE_PATHS = [
  'packages/apps',
  'packages/infrastructure/aws/lambdas',
  'packages/tests',
];

// typescript source directory in the packages
const SRC_DIR = 'src';

// export string to include in the index.ts file
const EXPORT_STRING = 'export * from "__file__";';

// path to the packages folder
const packagePath = path.join(__dirname, 'packages');

function createAllSubPackageIndexes(folderPath) {
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    if (file === 'node_modules') return;

    const filePath = path.join(folderPath, file);
    const fileStats = fs.statSync(filePath);
    if (fileStats.isFile()) {
      if (file === 'package.json') {
        // found a sub package!
        // find src directory
        const srcDirPath = path.join(folderPath, SRC_DIR);
        if (fs.existsSync(srcDirPath)) {
          // make index in path
          makeIndexFile(srcDirPath);
        }
      }
    } else if (fileStats.isDirectory()) {
      if (ignoreFilePath(filePath)) return;
      // recursively go through each directory
      createAllSubPackageIndexes(filePath);
    }
  });
}

function ignoreFilePath(filePath) {
  let ignore = false;
  const normalizedFilePath = filePath
    .replaceAll('\\\\', '\\')
    .replaceAll('\\', '/');
  PACKAGE_IGNORE_PATHS.forEach((path) => {
    if (normalizedFilePath.endsWith(path)) ignore = true;
  });
  return ignore;
}

function makeIndexFile(folderPath) {
  // if index already exists: bail
  // don't want to overwrite index if the project has a reason for that file
  const indexFilePath = path.join(folderPath, 'index.ts');
  if (fs.existsSync(indexFilePath)) return;

  // loop through all files in folder (except index)
  // and loop through all sub folders
  // then make index file with all references to files
  const fileList = generateFileList(folderPath, './');
  if (fileList.length > 0) {
    fs.writeFileSync(indexFilePath, '', 'utf8');
    fileList.forEach((file) => {
      const fileExportLine = EXPORT_STRING.replace('__file__', file);
      fs.appendFileSync(indexFilePath, fileExportLine + os.EOL, 'utf8');
    });

    fs.appendFileSync(
      indexFilePath,
      '// this file was created with the root index-maker.js' + os.EOL,
      'utf8'
    );
    fs.appendFileSync(
      indexFilePath,
      '// if there is a problem with an export' + os.EOL,
      'utf8'
    );
    fs.appendFileSync(
      indexFilePath,
      '// check that file and potentially add to the ignore paths' + os.EOL,
      'utf8'
    );
  }
}

function generateFileList(folderPath, filePathFromIndex) {
  const fileList = [];

  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const fileStats = fs.statSync(filePath);
    if (fileStats.isFile() && file !== 'index.ts' && file.endsWith('.ts')) {
      fileList.push(filePathFromIndex + file.substring(0, file.length - 3));
    } else if (fileStats.isDirectory()) {
      // recursively go through each directory
      fileList.push(
        ...generateFileList(filePath, filePathFromIndex + file + '/')
      );
    }
  });

  return fileList;
}

createAllSubPackageIndexes(packagePath);
