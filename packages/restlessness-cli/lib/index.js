module.exports = () => {
  const argv = require('minimist')(process.argv.slice(2))
  const chalk = require('chalk')

  switch(argv._[0]) {
    case 'new':
      require('./commands/new')(argv)
      break
    case 'dev':
      require('./commands/dev')(argv)
      break
    default:
      console.log(chalk.red('Wrong invocation of RLN'))
      break
  }
}
