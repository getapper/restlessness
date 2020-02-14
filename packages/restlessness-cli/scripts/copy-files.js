const fs = require('fs');
const path = require('path');
const rimraf = require("rimraf");

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

function copyFolderRecursiveSync( source, target ) {
  var files = [];

  var targetFolder = path.join( target, path.basename( source ) );
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

const backendRoot = path.join(__dirname, '..', 'lib', 'assets', 'backend')
const frontendRoot = path.join(__dirname, '..', 'lib', 'assets', 'frontend')
const sourceBackendRoot = path.join(__dirname, '..', 'rln-backend')
const sourceFrontendRoot = path.join(__dirname, '..', 'rln-frontend')

const exec = async () => {
  rimraf.sync(backendRoot);
  rimraf.sync(frontendRoot);
  if (!fs.existsSync(backendRoot)){
    fs.mkdirSync(backendRoot);
  }
  if (!fs.existsSync(frontendRoot)){
    fs.mkdirSync(frontendRoot);
  }
  copyFolderRecursiveSync(path.join(sourceBackendRoot, 'dist'), backendRoot)
  copyFileSync(path.join(sourceBackendRoot, 'endpoints.json'), backendRoot)
  copyFileSync(path.join(sourceBackendRoot, 'functions.json'), backendRoot)
  copyFileSync(path.join(sourceBackendRoot, 'serverless.yml'), backendRoot)
  copyFolderRecursiveSync(path.join(sourceFrontendRoot, 'build'), frontendRoot)
}

exec().then().catch(console.error)
