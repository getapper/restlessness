const { Project } = require('@restlessness/utilities')
const chalk = require('chalk')
const path = require('path')

process.GLOBAL = process.GLOBAL || {}
process.GLOBAL.CWD = process.cwd()

module.exports = async argv => {
  if (argv._.length > 2) {
    console.log(chalk.red('Unexpected number of arguments'))
  } else {
    if (argv._[1]) {
      process.GLOBAL.PRJ_DIR = path.join(process.GLOBAL.CWD, argv._[1])
    } else {
      process.GLOBAL.PRJ_DIR = process.GLOBAL.CWD
    }

    await Project.create(process.GLOBAL.PRJ_DIR, {installNodemodules: true})
    console.log(chalk.green('DONE!'))
    process.exit(0)
  }
}

