const fs = require('fs');
const path = require('path');
const os = require('os');

// if .env file doesn't exist
// read .env.example

// for each ${generated_*_number} generate a *
// then write each line to a .env file

const envFilePath = path.join(__dirname, '.env');
const envExampleFilePath = path.join(__dirname, '.env.example');

function createEnvFileIfDoesntExist() {
  if (!fs.existsSync(envFilePath)) {
    createEnvFileFromExample();
  }
}

function createEnvFileFromExample() {
  const exampleData = fs.readFileSync(envExampleFilePath, 'utf8');
  const lines = exampleData.split(/\r?\n/);

  // create file
  fs.writeFileSync(envFilePath, '', 'utf8');

  // process the lines from the example file
  // and then append them to the new file
  lines.forEach((line) => {
    const updatedLineData = processLine(line);
    //console.log(updatedLineData);
    fs.appendFileSync(envFilePath, updatedLineData + os.EOL, 'utf8');
  });
}

function processLine(line) {
  if (line.includes('${generated_')) {
    const beginIndex = line.indexOf('${generated_');
    const endIndex = line.indexOf('}', beginIndex);
    const variable = line.substring(beginIndex, endIndex + 1);
    const value = returnGenerated(variable);

    //console.log(`Variable: ${variable}; Value: ${value}`);
    line = line.replace(variable, value);

    // need to call recursively in case there are multiple things to replace in the line
    processLine(line);
  }

  return line;
}

const generated = {};
function returnGenerated(variable) {
  if (variable.startsWith('${generated_password_')) {
    if (generated[variable] === undefined) {
      generated[variable] = generatePassword();
    }
    return generated[variable];
  }

  throw new Error(
    `A new .env generated type was encountered but with no handler. Check .env.example for the type and .env-maker.js for the handler. Variable: ${variable}`
  );
}

function generatePassword() {
  // unsafe chars:
  // #@ (in mysql/prisma)
  // %  (in rabbitmq)
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyz!$^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const passwordLength = 13;

  let password = '';
  for (let i = 0; i < passwordLength; i++) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }

  return password;
}

createEnvFileIfDoesntExist();
