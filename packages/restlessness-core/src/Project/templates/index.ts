const generateSharedResourcesServerlessJson = (projectName: string) => `{
  "service": "${projectName}-shared",
  "provider": {
    "name": "aws",
    "runtime": "nodejs12.x",
    "stage": "\${opt:stage, 'dev'}"
  },
  "package": {
    "exclude": [
      ".serverless-outputs/**"
    ]
  },
  "resources": {
    "Resources": {
      "SharedGW": {
        "Type": "AWS::ApiGateway::RestApi",
        "Properties": {
          "Name": "${projectName}-\${self:provider.stage}"
        }
      }
    },
    "Outputs": {
      "apiGatewayRestApiId": {
        "Value": {
          "Ref": "SharedGW"
        },
        "Export": {
          "Name": "${projectName}-SharedGW-restApiId-\${self:provider.stage}"
        }
      },
      "apiGatewayRestApiRootResourceId": {
        "Value": {
          "Fn::GetAtt": [
            "SharedGW",
            "RootResourceId"
          ]
        },
        "Export": {
          "Name": "${projectName}-SharedGW-rootResourceId-\${self:provider.stage}"
        }
      }
    }
  }
}
`;

const generateOfflineServerlessJson = (projectName: string) => `{
  "service": "${projectName}-offline",
  "provider": {
    "name": "aws",
    "runtime": "nodejs12.x"
  },
  "plugins": [
    "serverless-offline",
    "serverless-plugin-warmup"
  ],
  "functions": {},
  "custom": {
    "warmup": {
      "prewarm": true,
      "enabled": true
    }
  }
}
`;

const generatePackageJson = (name: string) => `{
  "name": "${name}",
  "version": "0.0.0",
  "scripts": {
    "DEV:locale": "restlessness dev locale",
    "DEPLOY:staging": "restlessness create-env staging && restlessness deploy --stage dev",
    "REMOVE:staging": "restlessness remove --stage dev",
    "DEPLOY:production": "restlessness create-env production && restlessness deploy --stage prod",
    "REMOVE:production": "restlessness remove --stage prod",
    "test": "restlessness create-env test && jest --runInBand",
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
    "serverless-plugin-warmup": "4.9.0",
    "typescript": "3.8.3"
  },
  "peerDependencies": {
    "serverless": "^1.63.0"
  },
  "_moduleAliases": {
    "root": "dist"
  },
  "jest": {
    "testTimeout": 10000,
    "rootDir": "dist",
    "moduleNameMapper": {
      "root/models/(.*)": "<rootDir>/models/$1",
      "root/endpoints/(.*)": "<rootDir>/endpoints/$1"
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
  generateSharedResourcesServerlessJson,
  generateOfflineServerlessJson,
};
