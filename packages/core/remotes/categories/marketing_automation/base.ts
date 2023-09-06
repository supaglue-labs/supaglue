import type { FormField } from '@supaglue/types/marketing_automation/form_field';
import type { FormMetadata } from '@supaglue/types/marketing_automation/form_metadata';
import type { SubmitFormData, SubmitFormResult } from '@supaglue/types/marketing_automation/submit_form';
import type { RemoteClient } from '../../base';
import { AbstractRemoteClient } from '../../base';

export interface MarketingAutomationRemoteClient extends RemoteClient {
  submitForm(formId: string, formData: SubmitFormData): Promise<SubmitFormResult>;
  listForms(): Promise<FormMetadata[]>;
  getFormFields(formId: string): Promise<FormField[]>;
}

export abstract class AbstractMarketingAutomationRemoteClient
  extends AbstractRemoteClient
  implements MarketingAutomationRemoteClient
{
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  public async listForms(): Promise<FormMetadata[]> {
    throw new Error('Not implemented');
  }

  public async getFormFields(formId: string): Promise<FormField[]> {
    throw new Error('Not implemented');
  }

  public async submitForm(formId: string, formData: SubmitFormData): Promise<SubmitFormResult> {
    throw new Error('Not implemented');
  }
}
