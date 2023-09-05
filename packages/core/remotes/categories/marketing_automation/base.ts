import type { SubmitFormData, SubmitFormResult } from '@supaglue/types/marketing_automation/submit_form';
import type { RemoteClient } from '../../base';
import { AbstractRemoteClient } from '../../base';

export interface MarketingAutomationRemoteClient extends RemoteClient {
  submitForm(formId: string, formData: SubmitFormData): Promise<SubmitFormResult>;
}

export abstract class AbstractMarketingAutomationRemoteClient
  extends AbstractRemoteClient
  implements MarketingAutomationRemoteClient
{
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  public async getForms(): Promise<unknown[]> {
    throw new Error('Not implemented');
  }

  public async getFormFields(formId: string): Promise<unknown[]> {
    throw new Error('Not implemented');
  }

  public async submitForm(formId: string, formData: SubmitFormData): Promise<SubmitFormResult> {
    throw new Error('Not implemented');
  }
}
