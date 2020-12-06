import { SES, Credentials } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { AWSError } from 'aws-sdk/lib/error';

class AwsSES {
  awsSES: SES

  init() {
    const SESConfigOptions:SES.ClientConfiguration = {
      credentials: new Credentials(process.env['RLN_SES_AWS_ACCESS_KEY_ID'], process.env['RLN_SES_AWS_SECRET_ACCESS_KEY']),
      region: process.env['RLN_SES_AWS_REGION'],
    };
    this.awsSES = new SES(SESConfigOptions);
  }

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
}

const awsSES = new AwsSES();

export default () => {
  awsSES.init();
  return awsSES;
};
