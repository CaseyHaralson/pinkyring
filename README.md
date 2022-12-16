# pinkyring

A project generator that allows you to try a project, and then remove the pieces you don't want.

## New Project
Note: requires node to be installed.

To create a new project from one of the [templates](#templates):
1. Run the pinkyring command: `npx pinkyring`
2. Select "Create new project"
3. Select the template
4. Type in the name of your project

A new project from the selected template will be created in the current directory. Change to the new project folder and open the readme.

## Edit Existing Project
To edit a project that was created with pinkyring:
1. Navigate to the project that was created
2. Run the pinkyring command: `npx pinkyring`
3. Select "Edit existing project"
4. Use the prompt to remove whatever section(s).

### Clean Template Hooks
The templates expose functionality that can be removed and, once you have removed the things you don't need, all of those leftover hooks can be removed from the code.

Edit the project and select to remove the "PINKYRING HOOKS" option. This will clean the project of all pinkyring hooks while leaving the functionality intact.

## Templates

### pinkyring-server-template
[project source link](https://github.com/CaseyHaralson/pinkyring-server-template)

This is a server-side project template that is structured around the principals of the onion/hexagonal architecture.
It uses npm workspaces to separate functionality into different packages.

It comes with the following as a starting point:

- Github Workflows [^1]
  - CodeQL Analysis
  - Serverless Framework Deploy and Teardown into AWS
  - CI with unit and integration tests, and style/linting checks
- Serverless Framework [^1]
  - Configuration to deploy the following to AWS:
    - GraphQL Lambda
    - DB Migration Dockerfile/Lambda with Prisma
    - Mysql Serverless Aurora RDS
    - SNS Topic to SQS Queue which triggers lambda
    - Cron schedule triggers lambda
- Code Style Rules
  - ESLint
  - Prettier
- REST Endpoints [^1]
- Graphql Endpoint [^1]
- Prisma Database Stuff
- Winston Logging
- Yup data validations
- Jest tests
- Cron maintenance jobs [^1]
- Event bus/queue interactions with RabbitMQ [^1]

[^1]: Removable with pinkyring

## Development Mode
The rest of this document will be about the development of this project, not the templates. If you are interested in the development of a project based on a template, check out the project source readme in your project or from the appropriate link in the [templates section](#templates).

### Local Pinkyring Install

`npm install`

`npm run build`

`npm link`

Now `pinkyring` can be run from the command line using the local version.

### Adding New Template Options
The templates should have a .pinkyring.json file in the root of the project that adheres to the [IPinkyringConfig.ts file](./src/IPinkyringConfig.ts) from the src directory. An example .pinkyring.json implementation can be found [here](./templates/pinkyring-server-template/.pinkyring.json).

1. Clean the project of all files and folders that aren't tracked in source control, and then remove the source control folder.
2. Copy the cleaned project template into the templates directory of this project.

If you are running pinkyring locally, then you should now have access to the updated project.

### Updating Existing Template Options
1. Clean the project of all files and folders that aren't tracked in source control, and then remove the source control folder.
2. Delete the existing template project in the templates directory of this project.
3. Copy the cleaned project template into the templates directory of this project.

If you are running pinkyring locally, then you should now have access to the updated project.