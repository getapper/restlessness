/*
 * @TODO: provider data should be written and imported from a json file,
 * so it will possible to manage other providers as gcp as well
 */
const generateServerlessYaml = (): string => `service: \${file(./configs/serverless.json):service}

provider:
  name: aws
  runtime: nodejs12.x

plugins:
  - serverless-offline

functions: \${file(./configs/serverless.json):functions}
`;

const generateServerlessJson = (name: string) => `{
  "functions": {},
  "service": "${name}"
}
`;

const generatePackageJson = (name: string) => `{
  "name": "${name}",
  "version": "0.0.0",
  "scripts": {
    "DEV:locale": "restlessness dev locale",
    "DEPLOY:staging": "npm run tsc && restlessness create-env staging && serverless deploy --stage dev --verbose",
    "REMOVE:staging": "serverless remove --stage dev",
    "DEPLOY:production": "npm run tsc && restlessness create-env production && serverless deploy --stage prod --verbose",
    "REMOVE:production": "serverless remove --stage prod",
    "test": "restlessness create-env test && jest",
    "tsc": "rimraf dist && tsc -p tsconfig.json"
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
  generateServerlessJson,
};
