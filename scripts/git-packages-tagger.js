const { exec } = require("child_process");
const path = require('path');

const packageJson = require(path.join(process.cwd(), "package.json"));
console.log(packageJson.name, packageJson.version);

exec("git status --porcelain", (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
  if (!stdout) {
    exec(`git tag ${packageJson.name}-v${packageJson.version}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      process.exit(0);
    });
  } else {
    console.log(`Commit or revert these changes before adding a new tag release: \n${stdout}`);
    process.exit(1);
  }
});
