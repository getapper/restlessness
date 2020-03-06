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

const generatePackageJson = name => `{
  "name": "${name}",
  "version": "0.0.0",
  "scripts": {
    "dev:server": "tsc && serverless offline --port 3000"
  },
  "dependencies": {
    "module-alias": "2.2.0"
  },
  "devDependencies": {
    "@types/node": "12.7.2",
    "@typescript-eslint/parser": "^2.1.0",
    "eslint": "6.3.0",
    "serverless-offline": "5.12.1",
    "typescript": "3.7.5"
  },
  "peerDependencies": {
    "serverless": "^1.63.0"
  },
  "_moduleAliases": {
    "root": "dist"
  }
}
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
      execSync('npm i', {
        cwd: process.GLOBAL.PRJ_DIR,
        stdio: 'inherit'
      })
      execSync('npm i @restlessness/core@latest -S -E', {
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
