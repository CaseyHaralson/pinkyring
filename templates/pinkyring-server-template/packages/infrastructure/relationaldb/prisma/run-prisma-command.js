var shell = require('shelljs');

// script to help run prisma commands from the parent package
// used like "npm run prisma <command>"

// there are some commands that need a "local" .env file
// so the script will copy the parent file down locally
// and then remove the local .env file after the command is finished running

// the env file copying is handled in the package.json file
// one level above this folder
// that way this file should be more "stable"
// while the package can be moved around or used in different project structures

const args = process.argv;
// console.log(args);

if (args.length < 3) {
  throw new Error(
    'Missing prisma command. This script is used like: "npm run prisma <command>"'
  );
}

const argString = args.slice(2).join(' ');
// console.log(argString);

const commandsThatDontNeedLocalEnv = ['db seed'];
let makeLocalEnvFile = true;
if (commandsThatDontNeedLocalEnv.includes(argString.toLowerCase())) {
  makeLocalEnvFile = false;
}

if (makeLocalEnvFile) {
  // copy the .env file from the parent to the prisma folder
  // sometimes prisma needs the local .env file, and sometimes it doesn't
  console.log(
    `Copying the .env file from the parent to the prisma folder for this command`
  );
  shell.exec(`cd ../ && npm run prisma:env`);
}

// run the prisma command
//console.log(`running the prisma command "npx prisma ${argString}"`);
shell.exec(`cd ../ && npx prisma ${argString}`);

if (makeLocalEnvFile) {
  // delete the prisma .env file
  console.log(`Removing the prisma .env file`);
  shell.exec(`cd ../ && npm run prisma:env:remove`);
}
