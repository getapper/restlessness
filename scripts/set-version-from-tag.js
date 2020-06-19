const { execSync } = require('child_process')
const { writeFileSync } = require('fs')
const path = require('path')

console.log('--- RLN Npm publish script ---')

const packageJsonPath = path.join(process.cwd(), 'package.json')
console.log('Using package.json: ', packageJsonPath)
let packageJson
try {
  packageJson = require(packageJsonPath)
} catch {
  console.error(`Cannot find package.json in current directory (${process.cwd()})!`)
  process.exit(1)
}

let tag
try {
  tag = execSync('git tag --points-at HEAD').toString().trim()
  console.log('Using tag: ', tag)
} catch (e) {
  console.error(`Error, ${e}`)
  process.exit(1)
}

let version
try {
  const result = /v((\d+)(\.\d+){2})$/.exec(tag)
  version = result[1]
  console.log('Setting package.json version to: ', version)
} catch {
  console.error(`Cannot parse tag: ${tag}`)
  process.exit(1)
}

try {
  packageJson.version = version
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log('Package.json updated with tag version')
} catch {
  console.error('Cannot update package.json')
  process.exit(1)
}

console.log('--- END RLN Npm publish script ---')
