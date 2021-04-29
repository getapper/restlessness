import { SNS, Credentials } from 'aws-sdk';

class AwsSNS {
  awsSNS: SNS

  init() {
    const SNSConfigOptions:SNS.ClientConfiguration = {
      credentials: new Credentials(process.env['RLN_SES_AWS_ACCESS_KEY_ID'], process.env['RLN_SES_AWS_SECRET_ACCESS_KEY']),
      region: process.env['RLN_SES_AWS_REGION'],
    };
    this.awsSNS = new SNS(SNSConfigOptions);
  }

  /*
  async sendEmail(
    sender: string,
    receivers: string[],
    subject: string,
    content: string,
    awsSendEmailParams?: SES.Types.SendEmailRequest,
  ): Promise<SES.Types.SendEmailResponse> {
    const params: SES.Types.SendEmailRequest = {
      Source: sender,
      Destination: {
        ToAddresses: receivers,
      },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: content,
          },
        },
      },
      ...awsSendEmailParams,
    };
    return await this.awsSES.sendEmail(params).promise();
  }
   */

  async createTopic(topicName: string, displayName: string = topicName) {
    const params: SNS.Types.CreateTopicInput = {
      Name: topicName,
      Attributes:{
        DisplayName: displayName,
      },
    };
    return await this.awsSNS.createTopic(params).promise();
  }

  async publish(message: string, ARN: string, messageTitle: string){
    const params: SNS.Types.PublishInput = {
      MessageStructure: 'JSON',
      Message: JSON.stringify({
        default: message,
        title: messageTitle,
      }),
      TopicArn: ARN,
    };
    return await this.awsSNS.publish(params).promise();
  }

}

const awsSNS = new AwsSNS();

export default () => {
  awsSNS.init();
  return awsSNS;
};
