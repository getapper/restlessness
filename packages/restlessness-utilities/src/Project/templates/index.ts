/*
 * @TODO: provider data should be written and imported from a json file,
 * so it will possible to manage other providers as gcp as well
 */
const generateServerlessYaml = (name: string): string => `service: ${name}

provider:
  name: aws
  runtime: nodejs12.x

plugins:
  - serverless-offline

functions: \${file(./functions.json):functions}
`;

/*
 * @TODO: refactoring:
 * DEV:locale => "restlessness dev locale" (it will launch web interface and project API as well)
 * DEV:restlessness => to be remove
 * BUILD:stage => "restlessness build stage" (it will build a deploy folder containing all necessary to be deployed in stage and install packages with "npm i --production")
 * BUILD:production => "restlessness build production" (it will build a deploy folder containing all necessary to be deployed in production and install packages with "npm i --production")
 * DEPLOY:stage => "restlessness deploy stage" (it will call BUILD:stage, run the tests inside this folder and will run "serverless deploy --stage dev -v" inside the same folder)
 * DEPLOY:production => "restlessness deploy production" (it will call BUILD:production, run the tests inside this folder and will run "serverless deploy --stage deploy -v" inside the same folder)
 * TEST:unit => "jest" (it will launch jest tests)
 */
const generatePackageJson = (name: string) => `{
  "name": "${name}",
  "version": "0.0.0",
  "scripts": {
    "DEV:locale": "cp envs/locale.json env.json && tsc && RLN_ENV=locale serverless offline --host 0.0.0.0 --port 4000",
    "DEV:restlessness": "npx @restlessness/cli run",
    "DEPLOY:beta": "cp envs/beta.json env.json && tsc && serverless deploy --stage dev --verbose",
    "REMOVE:beta": "serverless remove --stage dev",
    "DEPLOY:production": "cp envs/production.json env.json && tsc && serverless deploy --stage deploy --verbose",
    "REMOVE:production": "serverless remove --stage production",
    "test": "cp envs/test.json env.json && jest",
    "test:ci": "cp envs/test.json env.json && tsc && jest"
  },
  "dependencies": {
    "module-alias": "2.2.0"
  },
  "devDependencies": {
    "@types/aws-lambda": "8.10.50",
    "@types/jest": "25.2.3",
    "@types/node": "12.7.2",
    "@typescript-eslint/parser": "2.1.0",
    "eslint": "6.8.0",
    "jest": "26.0.1",
    "serverless-offline": "5.12.1",
    "typescript": "3.8.3"
  },
  "peerDependencies": {
    "serverless": "^1.63.0"
  },
  "_moduleAliases": {
    "root": "dist"
  },
  "jest": {
    "rootDir": "dist",
    "moduleNameMapper": {
      "root/(.*)$": "<rootDir>/$1"
    }
  }
}
`;

const generateGitIgnore = (): string => `node_modules
.serverless
!.env.test

# IntelliJ
.idea

# OSX
.DS_Store

#TSC
/dist
`;

export {
  generateGitIgnore,
  generatePackageJson,
  generateServerlessYaml,
};
