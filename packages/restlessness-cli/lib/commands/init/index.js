const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

process.GLOBAL.CWD = process.cwd()

function copyFileSync( source, target ) {

  var targetFile = target;

  //if target is a directory a new file with the same name will be created
  if ( fs.existsSync( target ) ) {
    if ( fs.lstatSync( target ).isDirectory() ) {
      targetFile = path.join( target, path.basename( source ) );
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync( source, target, inside = false ) {
  var files = [];

  var targetFolder = inside ? target : path.join( target, path.basename( source ) );
  if ( !fs.existsSync( targetFolder ) ) {
    fs.mkdirSync( targetFolder );
  }

  //copy
  if ( fs.lstatSync( source ).isDirectory() ) {
    files = fs.readdirSync( source );
    files.forEach( function ( file ) {
      var curSource = path.join( source, file );
      if ( fs.lstatSync( curSource ).isDirectory() ) {
        copyFolderRecursiveSync( curSource, targetFolder );
      } else {
        copyFileSync( curSource, targetFolder );
      }
    } );
  }
}

const generateServerlessYaml = name => `service: ${name}

provider:
  name: aws
  runtime: nodejs12.x

plugins:
  - serverless-offline

functions: \${file(./functions.json):functions}
`

// @TODO: Move DEV and DEPLOY scripts to an external module like react-scripts (core?)
const generatePackageJson = name => `{
  "name": "${name}",
  "version": "0.0.0",
  "scripts": {
    "DEV:locale": "cp envs/locale.json env.json && tsc && RLN_ENV=locale serverless offline --host 0.0.0.0 --port 4000",
    "DEV:restlessness": "npx @restlessness/cli run",
    "DEPLOY:beta": "cp envs/beta.json env.json && tsc && serverless deploy --stage dev --verbose",
    "REMOVE:beta": "serverless remove --stage dev",
    "DEPLOY:production": "cp envs/production.json env.json && tsc && serverless deploy --stage deploy --verbose",
    "REMOVE:production": "serverless remove --stage production",
    "test": "cp envs/test.json env.json && jest",
    "test:ci": "cp envs/test.json env.json && tsc && jest"
  },
  "dependencies": {
    "module-alias": "2.2.0"
  },
  "devDependencies": {
    "@types/aws-lambda": "8.10.50",
    "@types/jest": "25.2.3",
    "@types/node": "12.7.2",
    "@typescript-eslint/parser": "2.1.0",
    "eslint": "6.8.0",
    "jest": "26.0.1",
    "serverless-offline": "5.12.1",
    "typescript": "3.8.3"
  },
  "peerDependencies": {
    "serverless": "^1.63.0"
  },
  "_moduleAliases": {
    "root": "dist"
  },
  "jest": {
    "rootDir": "dist",
    "moduleNameMapper": {
      "root/(.*)$": "<rootDir>/$1"
    }
  }
}
`

const generateGitIgnore = () => `node_modules
.serverless

# IntelliJ
.idea

# OSX
.DS_Store

#TSC
/dist
envs/beta.json
envs/production.json
`

module.exports = async argv => {
  if (argv._.length > 2) {
    console.log(chalk.red('Unexpected number of arguments'))
  } else {
    let name = ''
    if (argv._[1]) {
      name = argv._[1]
      process.GLOBAL.PRJ_DIR = path.join(process.GLOBAL.CWD, name)
    } else {
      name = process.GLOBAL.CWD.split('/').pop()
      process.GLOBAL.PRJ_DIR = process.GLOBAL.CWD
    }

    try {
      copyFolderRecursiveSync(path.join(__dirname, '..', '..', 'assets', 'boilerplate'), process.GLOBAL.PRJ_DIR, true)
      fs.writeFileSync(path.join(process.GLOBAL.PRJ_DIR, 'serverless.yml'), generateServerlessYaml(name))
      fs.writeFileSync(path.join(process.GLOBAL.PRJ_DIR, 'package.json'), generatePackageJson(name))
      fs.writeFileSync(path.join(process.GLOBAL.PRJ_DIR, '.gitignore'), generateGitIgnore())
      execSync('npm i', {
        cwd: process.GLOBAL.PRJ_DIR,
        stdio: 'inherit'
      })
      execSync('npm i @restlessness/core@latest -S -E', {
        cwd: process.GLOBAL.PRJ_DIR,
        stdio: 'inherit'
      })
      execSync('npm i yup -S -E', {
        cwd: process.GLOBAL.PRJ_DIR,
        stdio: 'inherit'
      })
      console.log(chalk.green('DONE!'))
    } catch (err) {
      console.log(chalk.red(err))
      process.exit(1)
    }
    process.exit(0)
  }
}

