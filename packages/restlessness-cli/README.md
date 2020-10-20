# @restlessness/cli [![npm version](https://img.shields.io/npm/v/@restlessness/cli.svg?style=flat)](https://www.npmjs.com/package/@restlessness/cli)
The CLI to manage [restlessness](https://github.com/getapper/restlessness) projects.

*Warning! This is still WIP!*

## Installation

#### npm
`npm install -g @restlessness/cli`

#### or use it with npx
`npx @restlessness/cli <command>` 


## Usage

### new
`restlessness new [project name]`

Create a project under `project-name` or inside the current working directory

Example:
```shell script
$ restlessness new project-1 
$ # or
$ npx @restlessness/cli new project-2
``` 

### dev
`restlessness dev <environment name>`

Run it inside a restlessness project to start the development servers:
- restlessness frontend
- restlessness backend
- your restlessness project

Example:
```shell script
$ restlessness dev locale
```

### deploy
`restlessness deploy [--env <environment name>] [service name]`

Deploy serverless services using the specified environment (default staging). The command will deploy all project's
services starting with the *shared service*, or only `[service name]` if provided.

Example:
```shell script
$ restlessness deploy
$ # or
$ restlessness deploy --env production
$ # or
$ restlessness deploy --evn production my-service
```

### remove 
`restlessness remove [--env <environment name>] [service name]`

Remove serverless services using the specified environment (default staging). The command will remove all project's
services, with the *shared service* as last one, or only `[service name]` if provided.

Example:
```shell script
$ restlessness remove
$ # or
$ restlessness remove --env production
$ # or
$ restlessness remove --env production my-service
``` 

### create-env
`restlessness create-env <environment name>`

Create a .env file under project root directory by copying and expanding the corresponding `envs/.env.<env name>` file

Example:
```shell script
$ restlessness create-env staging
```

### add-dao
`restlessness add-dao <package name>`

Add a dao package to the project

Example:
```shell script
$ restlessness add-dao @restlessness/dao-mongo
```

### add-auth
`restlessness add-auth <package name>`

Add an auth package to the project

Example:
```shell script
$ restlessness add-auth @restlessness/auth-jwt
```
