import type { SESv2Client } from '@aws-sdk/client-sesv2';
import { SendEmailCommand } from '@aws-sdk/client-sesv2';

export class NotificationService {
  #sesClient: SESv2Client;

  constructor(sesClient: SESv2Client) {
    this.#sesClient = sesClient;
  }

  // @todo: generate this for more emails
  public async sendSyncPausedEmail(customerId: string, providerName: string, object: string, to: string) {
    const command = new SendEmailCommand({
      FromEmailAddress: 'team+notifications@supaglue.com',
      Destination: {
        ToAddresses: [to],
      },
      Content: {
        Simple: {
          Subject: {
            Data: `Supaglue: sync paused (${customerId})`,
          },
          Body: {
            Text: {
              Data: `Sync for customer ${customerId} using ${providerName} with object ${object} was paused due to ongoing failures.`,
            },
            Html: {
              Data: `Sync for customer ${customerId} using ${providerName} with object ${object} was paused due to ongoing failures.`,
            },
          },
        },
      },
    });
    const response = await this.#sesClient.send(command); // @todo: handle error
  }
}
