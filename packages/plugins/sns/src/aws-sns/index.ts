import { SNS, Credentials } from 'aws-sdk';
const config = require('../../../env.json');

enum PlatformType {
  iOS = 'ios',
  Android = 'android',
}

class AwsSNS {
  awsSNS: SNS
  androidPlatformApplicationArn: string
  iosPlatformApplicationArn: string

  init() {
    const SNSConfigOptions:SNS.ClientConfiguration = {
      credentials: new Credentials(process.env['RLN_SNS_AWS_ACCESS_KEY_ID'], process.env['RLN_SNS_AWS_SECRET_ACCESS_KEY']),
      region: process.env['RLN_SNS_AWS_REGION'],
    };
    const {
      androidPlatformApplicationArn,
      iosPlatformApplicationArn,
    }= config.sns;
    this.awsSNS = new SNS(SNSConfigOptions);
    this.androidPlatformApplicationArn = androidPlatformApplicationArn;
    this.iosPlatformApplicationArn = iosPlatformApplicationArn;
  }

  async createDeviceEndpoint(platform: PlatformType, token: string, deviceARN: string): Promise<string> {
    const platformApplicationArn = platform === PlatformType.Android
        ? this.androidPlatformApplicationArn
        : this.iosPlatformApplicationArn;
    let endpointARN: string = null;
    if (!deviceARN) {
      const endpoint = await this.awsSNS.createPlatformEndpoint({
        PlatformApplicationArn: platformApplicationArn,
        Token: token,
      }).promise();
      deviceARN = endpoint.EndpointArn;
    }
    try {
      const { Attributes: endpointAttributes } = await this.awsSNS.getEndpointAttributes({
        EndpointArn: deviceARN,
      }).promise();
      const { Token: snsToken, Enabled: enabled } = endpointAttributes;
      console.log(snsToken, enabled);
      if (enabled !== 'true' || snsToken !== token) {
        await this.awsSNS.setEndpointAttributes({
          EndpointArn: deviceARN,
          Attributes: {
            Token: token,
          },
        }).promise();
        await this.awsSNS.setEndpointAttributes({
          EndpointArn: deviceARN,
          Attributes: {
            Enabled: 'true',
          },
        }).promise();
      }
    } catch (e) {
      console.error(e);
      const endpoint = await this.awsSNS.createPlatformEndpoint({
        PlatformApplicationArn: platformApplicationArn,
        Token: token,
      }).promise();
      deviceARN = endpoint.EndpointArn;
    }
    return deviceARN;
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

  async subscribeDeviceToTopic(topicARN: string, deviceARN: string): Promise<string> {
    const { SubscriptionArn: subscriptionARN } = await this.awsSNS.subscribe({
      TopicArn: topicARN,
      Protocol: 'application',
      Endpoint: deviceARN,
    }).promise();
    return subscriptionARN;
  }

  async unsubscribeDeviceFromTopic(subscriptionARN: string) {
    await this.awsSNS.unsubscribe({
      SubscriptionArn: subscriptionARN,
    });
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
