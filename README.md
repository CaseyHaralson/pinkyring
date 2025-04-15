# pinkyring

A project generator that allows you to try a project template, and then remove pieces of the template that you don't want.

Packaged templates:

- [starter-typescript-project:](#starter-typescript-project) basic "Hello, World!" Typescript project with an easy path forward to integrate Postgres with TypeORM, MongoDB, Redis, and/or Docker for building services
- [pinkyring-server-template:](#pinkyring-server-template) server-side NodeJS project template that is structured around the principals of the onion/hexagonal architecture and comes with a lot of capability
- [python-flask-template:](#python-flask-template) basic Python Flask api project with examples of using marshmallow for data validation and MongoDB for data storage
- [browser-extension-template:](#browser-extension-template) a starting point for generating browser extensions for multiple browsers
- [documentation-template:](#documentation-template) an outline for a documentation project using the PARA method, Zettelkasten method, and MOC approach.

## How-To

There are basically two steps:

1. Run pinkyring, select the template or repo to use, and name the project.
This creates a new project using the template you chose.
2. If you want to remove a piece that came with the template, go to the project, run pinkyring again, and select the piece(s) to remove.
This removes those sections from the project you created in step 1.

## Create Project from Template or Repo
Note: requires NodeJS to be installed.

New projects can be created from a template that has been "packaged" with pinkyring, or you can enter a repo and pinkyring can use that repo as the template.

### New Project From Packaged Template
To create a new project from one of the [packaged templates](#packaged-templates):
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

## Edit Project to Remove Pieces of the Template
To edit a project that was created with pinkyring:
1. Navigate to the project that was created
2. Run the pinkyring command: `npx pinkyring@latest`
3. Select "Edit existing project"
4. Use the prompt to remove whatever section(s)

### Clean Template Hooks
The templates expose functionality that can be removed and, once you have removed the things you don't need, all of those leftover hooks (for the functionality you decided to keep) can be removed from the code.
This will clean the project of all pinkyring hooks while leaving the functionality intact.

Edit the project and select to remove the "PINKYRING HOOKS" option to clean the project.

## Packaged Templates

### starter-typescript-project
[explore project source](https://github.com/CaseyHaralson/starter-typescript-project)

This is a starter "Hello World!" typescript project template. It has linting, prettier, and file watching for builds and running. It also includes a starter Dockerfile [^1] with current best practices, Postgres/TypeORM [^1], MongoDB [^1], and Redis [^1].

### pinkyring-server-template
[explore project source](https://github.com/CaseyHaralson/pinkyring-server-template)

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

### python-flask-template
[explore project source](https://github.com/CaseyHaralson/python-flask-template)

This is a starter Python Flask api project with examples of using marshmallow for data validation and MongoDB [^1] for data storage.
It also includes a starter Dockerfile [^1] that uses Gunicorn for production.

### browser-extension-template
[explore project source](https://github.com/CaseyHaralson/browser-extension-template)

This template is a starting point for generating browser extensions.
It can generate different extension builds for different browsers (Chrome and Firefox by default), and comes with the following as a starting point:

- **options page** (shown when editing an extension's options)
- **popup page** (shown when clicking on the extension)
- **background service worker** (runs behind the scenes with no access to a page's content)
- **content script that runs on every website** (runs with access to a page's content)

### documentation-template
[explore project source](https://github.com/CaseyHaralson/documentation-template)

This is a documentation project organized using the PARA method, with Zettelkasten principles for individual notes and MOCs (Maps of Content) as navigation hubs.

[^1]: This functionality is removable with pinkyring

## pinkyring Development
The rest of this document will be about the development of THIS project (pinkyring), not the templates.

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
