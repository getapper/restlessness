export const generateServiceServerlessJson = (projectName: string, serviceName: string): string => `{
  "service": "${projectName}-${serviceName}",
  "provider": {
    "name": "aws",
    "runtime": "nodejs12.x",
    "stage": "\${opt:stage, 'dev'}"
    "apiGateway": {
      "restApiId": {
        "Fn::ImportValue": "${projectName}-SharedGW-restApiId-\${self:provider.stage}"
      },
      "restApiRootResourceId": {
        "Fn::ImportValue": "${projectName}-SharedGW-rootResourceId-\${self:provider.stage}"
      }
    }
  },
  "package": {
    "exclude": [
      ".serverless-outputs/**"
    ]
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
