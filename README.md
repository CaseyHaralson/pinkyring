# pinkyring

A project generator that allows you to try a project template, and then remove pieces of the template that you don't want.

## New Project
Note: requires node to be installed.

New projects can be created from a template that has been "packaged" with pinkyring, or you can supply a repo and pinkyring can use that repo as the template.

### New Project From Packaged Template
To create a new project from one of the [packaged templates](#templates):
1. Run the pinkyring command: `npx pinkyring@latest`
2. Select "Create new project"
3. Select the template
4. Type in the name of your new project

A new project from the selected template will be created in the current directory. Change to the new project folder and open the readme.

### New Project From Github Repo
Note: the repo name is used as a pattern replacement and your new project name will overwrite it anywhere it is found in the new project.

To create a new project from a repo:
1. Run the pinkyring command: `npx pinkyring@latest`
2. Select "Create new project"
3. Select "I'll enter the repo" when asked what template to use
4. Enter the repo (like "owner/repo-name")
5. Type in the name of your new project

A new project from the entered repo will be created in the current directory. 

## Edit Existing Project
To edit a project that was created with pinkyring:
1. Navigate to the project that was created
2. Run the pinkyring command: `npx pinkyring@latest`
3. Select "Edit existing project"
4. Use the prompt to remove whatever section(s).

### Clean Template Hooks
The templates expose functionality that can be removed and, once you have removed the things you don't need, all of those leftover hooks can be removed from the code.

Edit the project and select to remove the "PINKYRING HOOKS" option. This will clean the project of all pinkyring hooks while leaving the functionality intact.

## Templates

### base-typescript-project
[project source repository](https://github.com/CaseyHaralson/base-typescript-project)

This is a starter "Hello World!" typescript project template. It has linting, prettier, and file watching for builds and running.

### pinkyring-server-template
[project source repository](https://github.com/CaseyHaralson/pinkyring-server-template)

This is a server-side project template that is structured around the principals of the onion/hexagonal architecture.

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
- Event bus/queue interactions with RabbitMQ/Serverless [^1]

[^1]: Removable with pinkyring

## Development Mode
The rest of this document will be about the development of this project, not the templates. If you are interested in the development of a project based on a template, check out the project source readme in your project or from the appropriate link in the [templates section](#templates).

### Local pinkyring Install

`npm install`

`npm run build`

`npm link`

Now `npx pinkyring` can be run from the command line using the local version. When you want to remove the pinkyring link, run: `npm uninstall -g pinkyring`

You can test command line arguments by running the following from inside the root of the project: `npx .`

### Adding New Template Options

Edit the templates.json file and add a new entry somewhere above the "I'll enter the repo" entry. The "I'll enter the repo" entry should always come last in the file. The new entry should adhere to the [ITemplatesConfig.ts file](./src/ITemplatesConfig.ts) from the src directory.

If you want the new template to have the capacity to remove pieces of the template after the project has been created, the project will need a .pinkyring.json file.
The template should have a .pinkyring.json file in the root of the project that adheres to the [IPinkyringConfig.ts file](./src/IPinkyringConfig.ts) from the src directory. An example .pinkyring.json implementation can be found [here](https://github.com/CaseyHaralson/pinkyring-server-template/blob/main/.pinkyring.json).
