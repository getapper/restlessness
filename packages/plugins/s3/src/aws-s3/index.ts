import { S3, Credentials } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { AWSError } from 'aws-sdk/lib/error';
import path from 'path';

class AwsS3 {
  awsS3: S3

  init() {
    const s3ConfigOptions:S3.ClientConfiguration = {
      credentials: new Credentials(process.env['RLN_S3_AWS_ACCESS_KEY_ID'], process.env['RLN_S3_AWS_SECRET_ACCESS_KEY']),
      region: process.env['RLN_S3_AWS_REGION'],
    };
    this.awsS3 = new S3(s3ConfigOptions);
  }

  async upload(bucket: S3.BucketName, path: S3.ObjectKey, body: S3.Body, params?: S3.Types.PutObjectRequest): Promise<S3.ManagedUpload.SendData> {
    return this.awsS3.upload({
      Bucket: bucket,
      Key: path,
      Body: body,
      ...params,
    }).promise();
  }

  async deleteFile(bucket: S3.BucketName, path: S3.ObjectKey, params?: S3.DeleteObjectRequest): Promise<PromiseResult<S3.DeleteObjectOutput, AWSError>> {
    return this.awsS3.deleteObject({
      Bucket: bucket,
      Key: path,
      ...params,
    }).promise();
  }

  async deleteFolder(bucket: S3.BucketName, path: S3.ObjectKey): Promise<PromiseResult<S3.DeleteObjectsOutput, AWSError>> {
    const result = await this.awsS3.listObjectsV2({
      Bucket: bucket,
      Prefix: path,
    }).promise();
    if (result.Contents.length === 0) {
      return null;
    }
    const deleteParams: S3.DeleteObjectsRequest = {
      Bucket: bucket,
      Delete: {
        Objects: [],
      },
    };
    result.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
    });
    return this.awsS3.deleteObjects(deleteParams).promise();
  }
}

const s3 = new AwsS3();

export default () => {
  s3.init();
  return s3;
};
