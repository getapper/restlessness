import { S3, Credentials } from 'aws-sdk';
import path from 'path';

class RLNS3 {
  awsS3: S3

  constructor() {
    const config = require(path.join(process.cwd(), 'env.json'));
    const credentials = config?.s3?.credentials ?? null;
    const region = config?.s3?.region ?? null;
    if (credentials === null || region === null) {
      throw new Error('No s3 configuration found in env.json');
    }
    const s3ConfigOptions:S3.ClientConfiguration = {
      credentials: new Credentials(credentials.accessKeyId, credentials.secretAccessKey),
      region,
    };
    this.awsS3 = new S3(s3ConfigOptions);
  }

  async upload(bucket: S3.BucketName, path: S3.ObjectKey, body: S3.Body) {
    this.awsS3.upload({
      Bucket: bucket,
      Key: path,
      Body: body,
    });
  }
}

const s3 = new RLNS3();

export default () => s3;
