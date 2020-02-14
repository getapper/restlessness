const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

process.GLOBAL.CWD = process.cwd()

module.exports = async argv => {
  const port = argv.port || argv.p || 4123
  try {
    const backend = spawn('serverless', ['offline', '--port', 4123], {
      cwd: path.join(__dirname, '..', '..', 'assets', 'backend'),
      env: {
        ...process.env,
        PRJ_PATH: process.GLOBAL.CWD
      },
      stdio: 'inherit'
    })
    backend.on('error', console.log)
    const frontend = spawn('serve', [], {
      cwd: path.join(__dirname, '..', '..', 'assets', 'frontend', 'build'),
      stdio: 'inherit'
    })
    frontend.on('error', console.log)
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}

