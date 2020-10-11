export interface InfoState {
  projectName: string;
  organization?: string | undefined;
  app?: string | undefined;
  region?: string | undefined;
}

export const regions: any = {
  "us-east-1": "US East (N. Virginia)",
  "us-east-2": "US East (Ohio)",
  "us-west-1": "US West (N. California)",
  "us-west-2": "US West (Oregon)",
  "ca-central-1": "Canada (Central)",
  "eu-west-1": "EU (Ireland)",
  "eu-central-1": "EU (Frankfurt)",
  "eu-west-2": "EU (London)",
  "eu-west-3": "EU (Paris)",
  "eu-north-1": "EU (Stockholm)",
  "ap-northeast-1": "Asia Pacific (Tokyo)",
  "ap-northeast-2": "Asia Pacific (Seoul)",
  "ap-southeast-1": "Asia Pacific (Singapore)",
  "ap-southeast-2": "Asia Pacific (Sydney)",
  "ap-south-1": "Asia Pacific (Mumbai)",
  "sa-east-1": "South America (São Paulo)",
  "us-gov-west-1": "US Gov West 1",
  "us-gov-east-1": "US Gov East 1",
};
