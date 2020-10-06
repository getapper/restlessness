export const generateServiceServerlessJson = (projectName: string, serviceName: string): string => `{
  "service": "${projectName}-${serviceName}",
  "provider": {
    "name": "aws",
    "runtime": "nodejs12.x",
    "apiGateway": {
      "restApiId": {
        "Fn::ImportValue": "${projectName}-SharedGW-restApiId"
      },
      "restApiRootResourceId": {
        "Fn::ImportValue": "${projectName}-SharedGW-rootResourceId"
      }
    }
  },
  "plugins": [
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
