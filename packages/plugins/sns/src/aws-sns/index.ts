import { SNS, Credentials } from 'aws-sdk';

class AwsSNS {
  awsSNS: SNS

  init() {
    const SNSConfigOptions:SNS.ClientConfiguration = {
      credentials: new Credentials(process.env['RLN_SNS_AWS_ACCESS_KEY_ID'], process.env['RLN_SNS_AWS_SECRET_ACCESS_KEY']),
      region: process.env['RLN_SNS_AWS_REGION'],
    };
    this.awsSNS = new SNS(SNSConfigOptions);
  }

  async createTopic(topicName: string, displayName: string = topicName) {
    const params: SNS.Types.CreateTopicInput = {
      Name: topicName,
      Attributes:{
        DisplayName: displayName,
      },
    };
    return await this.awsSNS.createTopic(params).promise();
  }

  async publish(
      ARN: string,
      message: string,
      subject?: string,
      groupId?: string,
      attributes?: SNS.MessageAttributeMap,
  ){
    const params: SNS.Types.PublishInput = {
      Subject: subject,
      Message: message,
      TopicArn: ARN,
      MessageGroupId: groupId,
      MessageAttributes: attributes,
    };
    return await this.awsSNS.publish(params).promise();
  }

}

const awsSNS = new AwsSNS();

export default () => {
  awsSNS.init();
  return awsSNS;
};
