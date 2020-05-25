const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

process.GLOBAL.CWD = process.cwd()

module.exports = async argv => {
  // @TODO check node version >= 12.x
  const port = argv.port || argv.p || 4123
  try {
    const backend = spawn('serverless', ['offline', '--port', 4123], {
      cwd: path.join(__dirname, '..', '..', 'assets', 'backend'),
      env: {
        ...process.env,
        PRJ_PATH: process.GLOBAL.CWD
      },
      stdio: 'inherit',
      shell: true
    })
    backend.on('error', console.log)
    const frontend = spawn('serve', [], {
      cwd: path.join(__dirname, '..', '..', 'assets', 'frontend', 'build'),
      stdio: 'inherit',
      shell: true,
    })
    frontend.on('error', err => {
      console.log('Error while starting frontend with serve. Maybe you forgot to install it with: npm i serve -g')
      process.exit(1)
    })
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}

