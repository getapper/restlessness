module.exports = () => {
  const argv = require('minimist')(process.argv.slice(2))
  const chalk = require('chalk')

  switch(argv._[0]) {
    case 'init':
      require('./commands/init')(argv)
      break
    case 'run':
      require('./commands/run')(argv)
      break
    default:
      console.log(chalk.red('Wrong invocation of RLN'))
      break
  }
}
