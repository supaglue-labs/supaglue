import type { FormField } from '@supaglue/types/marketing_automation/form_field';
import type { FormMetadata } from '@supaglue/types/marketing_automation/form_metadata';
import type { SubmitFormData, SubmitFormResult } from '@supaglue/types/marketing_automation/submit_form';
import { remoteDuration } from '../../../lib/metrics';
import type { RemoteService } from '../../remote_service';

export class MarketingAutomationCommonObjectService {
  readonly #remoteService: RemoteService;

  public constructor(remoteService: RemoteService) {
    this.#remoteService = remoteService;
  }

  public async submitForm(connectionId: string, formId: string, formData: SubmitFormData): Promise<SubmitFormResult> {
    const [remoteClient, providerName] = await this.#remoteService.getMarketingAutomationRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'submitForm', remote_name: providerName });
    const obj = await remoteClient.marketingAutomationSubmitForm(formId, formData);
    end();

    return obj;
  }

  public async listForms(connectionId: string): Promise<FormMetadata[]> {
    const [remoteClient, providerName] = await this.#remoteService.getMarketingAutomationRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'listForms', remote_name: providerName });
    const obj = await remoteClient.marketingAutomationListForms();
    end();

    return obj;
  }

  public async getFormFields(connectionId: string, formId: string): Promise<FormField[]> {
    const [remoteClient, providerName] = await this.#remoteService.getMarketingAutomationRemoteClient(connectionId);

    const end = remoteDuration.startTimer({ operation: 'listForms', remote_name: providerName });
    const obj = await remoteClient.marketingAutomationGetFormFields(formId);
    end();

    return obj;
  }
}
