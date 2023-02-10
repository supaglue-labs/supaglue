import { Request, Response, Router } from 'express';
import jsforce from 'jsforce';
import { SALESFORCE } from '../constants';
import { getDependencyContainer } from '../dependency_container';
import { errorMiddleware as posthogErrorMiddleware, middleware as posthogMiddleware } from '../lib/posthog';

const { integrationService, developerConfigService } = getDependencyContainer();

const router: Router = Router({ mergeParams: true });

type SObjectField = {
  name: string;
  label: string;
};

router.get(
  '/',
  posthogMiddleware('Get Fields'),
  async (
    req: Request<never, any, never, { customerId: string; syncConfigName: string }>,
    res: Response<{ label: string; name: string }[]>
  ) => {
    const { customerId, syncConfigName } = req.query;
    const developerConfig = await developerConfigService.getDeveloperConfig();
    const syncConfig = developerConfig.getSyncConfig(syncConfigName);

    // TODO: Support grabbing fields for other syncs

    if (syncConfig.type !== 'inbound') {
      throw new Error('Fields only supported for inbound syncs for now');
    }

    if (syncConfig.source.objectConfig.type !== 'specified') {
      throw new Error('Fields only supported for salesforce specified object for now');
    }

    const salesforceObject = syncConfig.source.objectConfig.object;

    const integration = await integrationService.getByCustomerIdAndType(customerId, SALESFORCE, true);

    const oauth2 = new jsforce.OAuth2({
      ...developerConfig.getSalesforceCredentials(),
      redirectUri: `${process.env.API_SERVER_URL}/oauth/callback`,
    });
    const { instanceUrl, refreshToken } = integration.credentials;
    const connection = new jsforce.Connection({ oauth2, instanceUrl, refreshToken });
    const result = await connection.sobject(salesforceObject).describe$();

    const fields = result.fields.map((field) => ({ label: field.label, name: field.name }));
    fields.sort((a: SObjectField, b: SObjectField) => a.label.localeCompare(b.label));

    return res.status(200).send(fields);
  },
  posthogErrorMiddleware('Get Fields')
);

export default router;
