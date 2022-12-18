# pinkyring-server-template

This project was created with the Pinkyring project creator.
Please check that documentation to create another project or to remove some pre-installed code from this project.
https://github.com/CaseyHaralson/pinkyring

This project comes with the following as a starting point:

[//]: # (.pinkyring=GITHUB_WORKFLOWS)

- Github Workflows [^1]
  - CodeQL Analysis
  - Serverless Framework Deploy and Teardown into AWS
  - CI with unit and integration tests, and style/linting checks

[//]: # (.pinkyring=GITHUB_WORKFLOWS.end)
[//]: # (.pinkyring=SERVERLESS)

- Serverless Framework [^1]
  - Configuration to deploy the following to AWS:
    - GraphQL Lambda
    - DB Migration Dockerfile/Lambda with Prisma
    - Mysql Serverless Aurora RDS
    - SNS Topic to SQS Queue which triggers lambda
    - Cron schedule triggers lambda

[//]: # (.pinkyring=SERVERLESS.end)

- Code Style Rules
  - ESLint
  - Prettier

[//]: # (.pinkyring=REST_ENDPOINTS)

- REST Endpoints [^1]

[//]: # (.pinkyring=REST_ENDPOINTS.end)
[//]: # (.pinkyring=GRAPHQL)

- Graphql Endpoint [^1]

[//]: # (.pinkyring=GRAPHQL.end)

- Prisma Database Stuff
- Winston Logging
- Yup data validations
- Jest tests

[//]: # (.pinkyring=CRON_JOBS)

- Cron maintenance jobs [^1]

[//]: # (.pinkyring=CRON_JOBS.end)
[//]: # (.pinkyring=EVENT_SYSTEM)

- Event bus/queue interactions with RabbitMQ [^1]

[//]: # (.pinkyring=EVENT_SYSTEM.end)

[^1]: Removable with pinkyring

## Project Structure

The project is structured around the principals of the onion/hexagonal architecture.
It uses npm workspaces to separate functionality into different packages.

- https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/
- https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)

Basically, the **core package** has no external dependencies and defines the interfaces that it will need implemented. These are services and core business logic that wouldn't change if there were infrastructure changes.

The **infrastructure packages** implement the interfaces defined in the core.
These packages give access to repositories, logging frameworks, etc.
External dependencies will probably be utilized in these packages.

The **dependency container** ties the core and infrastructure packages together.
This package knows everything about how things are tied together and can give different interface implementations based on environments or other rules. It also exposes services and other helpers so the apps can have access to these objects.

The **apps packages** expose the functionality of the project. These are things that need to run, like endpoint servers, event listeners, or chron jobs. They ask the dependency container for objects.

## Getting Started

Note: you will need docker installed and running.

### Run Everything Locally

1. Install dependencies:

`npm install`

2. Build everything, create the database, and run the apps:

`npm run everything`

3. When you are finished exploring:

`npm run everything:stop`

### Exploring Everything

After docker has everything running (several of the containers will wait until the prisma service stops before they themselves run), you should have access to the following services:

[//]: # (.pinkyring=GRAPHQL)

- Graphql Server: http://localhost:4000/graphql
  - queries and mutations
  - note: create a new blog post here to trigger events

[//]: # (.pinkyring=GRAPHQL.end)
[//]: # (.pinkyring=REST_ENDPOINTS)

- Rest Server:
  - Hello world: http://localhost:3000/
  - Get authors: http://localhost:3000/authors
  - Get blog posts: http://localhost:3000/blogposts
  - Several event endpoints (maybe not as useful as the true event listener below)
    - Create a queue to listen to new blog post events
      - Post to: http://localhost:3000/event/queue/new
      - with "name" as a query param or in the body (name=new.queue)
    - Pick up an event from the queue you just created
      - Post to: http://localhost:3000/event/:queuename/grab
      - this is a post request because it changes the system

[//]: # (.pinkyring=REST_ENDPOINTS.end)
[//]: # (.pinkyring=EVENT_SYSTEM)

- An event listener that is triggered from new blog post events
  - Open the running docker container and look at the logs to see the event action

[//]: # (.pinkyring=EVENT_SYSTEM.end)
[//]: # (.pinkyring=CRON_JOBS)

- A cron jobs service running maintenance jobs
  - Open the running docker container and look at the logs to see the action

[//]: # (.pinkyring=CRON_JOBS.end)

## Development Mode

Note: you will need docker installed and running.

### Setup

1. Install dependencies:

`npm install`

2. Build project:

`npm run build`

3. Create the local .env file:

`npm run generate:env`

4. Run the infrastructure:

`npm run infra`

5. Generate database stuff:
    1. Generate prisma client locally (to make sure it matches your environment): `npm run prisma generate`
    2. Deploy the database schema: `npm run prisma migrate deploy`
    3. Seed the database: `npm run prisma db seed`

6. Navigate to one of the apps packages (packages/apps/api-graphql for example) and then run start:

`npm run start`

7. Stop the infrastructure when you are done:

`npm run infra:stop`

### Making Changes

#### Core Services
The BlogService in the core/services folder is an example of selecting and modifying data. The addBlogPost function also has an example of publishing an event.

Everything in the project revolves around the core services so this is a good place to start for looking at how things connect.

#### Security Principal
The security principal object is defined in the core/interfaces folder. This is just a sketched in object for you to change to your situation.

There is a security principal resolver in the infrastructure/util package. This package can be used to install external dependencies so you can resolve security objects that work with your system.

#### Session
The session is currently used as a way of passing data around for logging. The ISession interface in the core/interfaces folder defines what data is in the session. The SessionHandler in the infrastructure/util package creates and serves out session data.

#### Idempotent Requests
Idempotent requests are requests that need to only have an effect once, but will return the same result every time they are called. Making idempotent requests as small as possible can help with timeout and failure issues.

The idempotent request helper will take a requestId from the client and save the result of the request. It will then return that same result if it receives that requestId again. The request is unique by a combination of principal, service, function, and requestId.

[//]: # (.pinkyring=GRAPHQL)

#### Graphql
The main Graphql files are in the core/graphql folder. The schema file defines the types and resolvers. The IContext file is used to load necessary services and objects into the resolvers. And, lastly, the IDataLoader can be used for data and batch loading objects.

The graphql apps will need to reference the type/resolvers and load the IContext object. An example app is provided.

[//]: # (.pinkyring=GRAPHQL.end)
[//]: # (.pinkyring=EVENT_SYSTEM)

#### Events
Events are a way that the services can handle some things asynchronously. They are defined in the core/dtos folder. They are also a way that some external service can get access to what is happening in the project.

[//]: # (.pinkyring=EVENT_SYSTEM.end)

#### Data Validations
There is a specific package for basic data validations in the infrastructure/data-validations package. These can do validations before hitting the database and it's possible to publish this package so UI projects can run data validations before sending data to the server.

There are also some data validations done at the database level. These validations can be seen in the infrastructure/relationaldb/util folder in the prismaErrors file.

#### Configurations
There is a central configuration helper that will help get configurations for the project. It tries to get configurations from the environment first, then from an .env file. 

The configuration helper also allows settings to be set as "secret" which will only be able to come from a secret repository. The project template doesn't come with a secret repo so it is set as null in the di container loader. To load secrets, a file that implements the secret repository interface (from the core/interfaces/IConfig file) will need to be created and set in the di container loading function.

#### Tests
The unit and integration tests are all in the tests package.

- Run unit tests: `npm run test:unit`
- Watch unit tests: `npm run test:unit:watch`
- Run integration tests:
  - make sure the infrastructure is running: `npm run infra`
  - run tests: `npm run test:it`

#### Adding New Project Packages
1. Create the package folder
2. Copy a package.json and tsconfig.json file from one of the other packages
3. Edit the name, dependencies, and dev dependencies in the package.json and the references in the tsconfig.json
4. Create a src folder in the new package
5. Add the new package references to the root package.json and tsconfig.json files
6. Add the new package references to any other packages that will need the reference (di-container, etc)
7. Adding external npm dependencies can be done from the root by using the command outlined in the Notes section

### Notes

#### Helpful Rule
- Things internal to the main project (non-apps) can get their dependencies injected via their class constructor by the di container. External facing packages (apps) can ask the di container for things that have been specifically exposed.

#### Local Infrastructure Passwords
The passwords are generated and kept in the .env file. If this file gets deleted then the local infrastructure will probably need to be deleted and recreated with a new .env file (or your own passwords).

#### Installing New npm Packages to a Workspace Package
From the project root:

`npm install <npm package> --save -w packages/<project package.json path>`

Example (save some package to infrastructure util package):

`npm install <npm package> --save -w packages/infrastructure/util`

#### VS Code Typescript Intellisense
If VS Code intellisense isn't working after some change, the following steps can help:

1. `npm run build:clean`
2. `npm run build`
3. With a typescript file open, open the command palette (maybe ctrl + shift + p), and then select Typescript: Restart TS server

#### Prisma Commands
You can run prisma commands from the root project with the following command. There is a script that handles these commands and will also try to take care of keeping a local .env file in sync with the parent .env file.

`npm run prisma <prisma command>`

#### Replacing Prisma
Prisma can be switched out for some other database helper/ORM by changing the following:
- the docker Dockerfile.prisma file
- the docker compose run-everything file
- the relationaldb package infrastructure project

[//]: # (.pinkyring=GITHUB_WORKFLOWS)

- the github ci-check workflow

[//]: # (.pinkyring=SERVERLESS)

- the github serverless.deploy workflow

[//]: # (.pinkyring=SERVERLESS.end)
[//]: # (.pinkyring=GITHUB_WORKFLOWS.end)
[//]: # (.pinkyring=SERVERLESS)

- the serverless.yml file and the serverless dbmigration files

[//]: # (.pinkyring=SERVERLESS.end)

#### Replacing MySQL
MySQL can be switched out for some other database by changing the following:
- the docker compose files
- the prisma schema file and migrations

[//]: # (.pinkyring=GITHUB_WORKFLOWS)

- the github ci-check workflow

[//]: # (.pinkyring=GITHUB_WORKFLOWS.end)
[//]: # (.pinkyring=SERVERLESS)

- the serverless.yml file and the serverless rds resource file

[//]: # (.pinkyring=SERVERLESS.end)

## Published Packages
The project can publish several things to help other projects interface with it. The core/dtos folder and the infrastructure/data-validations packages can be published which will give access to:
- the different object types the project is expecting
- data validations for the different objects
- the events that are published
- expected errors the project can throw

Once you figure out a versioning scheme, and where you want to publish the packages, there is a npm script set up to help with publishing. Running `npm run pub` from the top level project will currently: 
- build the project
- copy the version from the main project.json file over to the different projects (if those projects don't have a version specified)
- run the associated "pub" commands in the core and infrastructure/data-validations packages
  - the "pub" commands in those packages will need to be filled out to handle publishing

### Using the Published Packages in Local Development
If you want to develop this project and another project (e.g. a UI project) simultaneously:

#### Setup
1. In this project, run `npm run dev-link` to build a global package link to this project
2. In the other project (UI project), create a "dev-link" package.json script with the following:
  - "npm link @pinkyring-server-template/core @pinkyring-server-template/infrastructure_data-validations"

#### During Development
1. In this project, run `npm run build:watch` to continually build changed files
2. In the other project (UI project), run `npm run dev-link`
  - this may need to be run any time `npm install` is run in the other project (UI project)

#### Adding This Project as a Dependency
Before adding a package.json dependency reference to one of these published packages, the packages must be published at least once. A dependency on a linked project won't work without one "real" publish. 

You can always create the development links without a real publish, but you can't add the dependency reference until this project has been published once.

[//]: # (.pinkyring=SERVERLESS)

## Serverless Deploy

[//]: # (.pinkyring=GITHUB_WORKFLOWS)

There is a github action that is setup to allow manual triggering of the deployment and teardown process.

### Github Setup
You will need to create an AWS access key with permissions to create items in your AWS account. Save the access key in the github project -> Settings tab -> Secrets -> Actions as new repository secrets with the following keys: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.

After this, you can go to to the github project -> Actions tab and trigger deployments or teardown the deployments manually.

[//]: # (.pinkyring=GITHUB_WORKFLOWS.end)

### Serverless Setup
The serverless config file is in the root directory. The AWS lambdas and event repository implementations are in the packages/infrastructure/aws folder. The different resources that are deployed along with the lambdas are in the serverless folder.

There is a database migration lambda that is packaged as a docker image in the serverless/dbmigration folder. This is deployed in the serverless deploy and the github action is setup to call the lambda after deployment so the database can be created/migrated automatically.

The database username and password are set in the main serverless file. These should ultimately come from a secrets store, but are just mocked in for the template.

[//]: # (.pinkyring=SERVERLESS.end)