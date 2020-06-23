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

let tags
try {
  // Get all tags related to the latest commit
  tags = execSync('git tag --points-at HEAD').toString().trim().split('\n')
} catch (e) {
  console.error(`Error, ${e}`)
  process.exit(1)
}

// Find the tag related to the current considered package
const tagRe = new RegExp(`^${packageJson.name}/v(\\d+)\\.(\\d+)\\.(\\d+)$`)
const tag = tags.find(t => tagRe.test(t))
if (!tag) {
  console.error(`Cannot find compatible tag for package ${packageJson.name}`)
  process.exit(1)
}
console.log('Using tag: ', tag)

// Package.json version is fixed to 0.0.0 and only updated before publish
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
