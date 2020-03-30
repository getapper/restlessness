# restlessness
A framework to easy develop and deploy serverless AWS lambdas REST APIs

*Warning! This is still WIP!*

## Why

We believe that [serverless.com](www.serverless.com) framework is great, because it allows you to easily deploy RESTFul APIs.

But still filling the serverless.yml file by hand is tedious, as is creating and organizing a folder tree that contains the single lambda files.

That's why we decided to build a framework that allows you to:
- create a new project and all the needed boilerplate with a single cli command (like create-react-app)
- interact with it through a web interface that runs locally with another cli command to (almost) completely manage it  

## How

### install 

Restlessness suggests to use `npx` to launch its commands:

```bash
npx @restlessness/cli init projectName
```

With the `init` command you will create a new restlessness project inside your cwd with all the boilerplate you need to develop and deploy your app.

### develop

Thanks to this web interface you can:
- Create new **routes**
- Create new **models**
- Create new **development environments**

**Intrigued? Find out more!**
 
 

## CLI

The CLI package README useful to install and interact with a RLN project is available [here](https://github.com/getapper/restlessness/tree/master/packages/restlessness-cli).
