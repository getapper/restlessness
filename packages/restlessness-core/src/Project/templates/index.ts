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
    ],
    "include": [
      ".env"
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
    "serverless-offline"
  ],
  "functions": {}
}
`;

const generatePackageJson = (name: string) => `{
  "name": "${name}",
  "version": "0.0.0",
  "scripts": {
    "DEV:locale": "restlessness dev locale",
    "DEPLOY:staging": "restlessness create-env staging && restlessness deploy --env staging",
    "REMOVE:staging": "restlessness remove --env staging",
    "DEPLOY:production": "restlessness create-env production && restlessness deploy --env production",
    "REMOVE:production": "restlessness remove --env production",
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
    "jest": "26.0.1",
    "prettier": "2.6.2",
    "serverless-offline": "6.8.0",
    "serverless-plugin-warmup": "4.9.0",
    "serverless-prune-plugin": "1.4.3",
    "typescript": "4.6.2"
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
      "root/(.*)": "<rootDir>/$1",
      "root/(.*)/(.*)": "<rootDir>/$1/$2",
      "root/(.*)/(.*)/(.*)": "<rootDir>/$1/$2/$3"
    }
  }
}
`;

const generateGitIgnore = (): string => `node_modules
.serverless
.serverless-outputs
!.env.test
/.env

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
