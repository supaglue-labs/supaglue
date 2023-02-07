import { Request, Response, Router } from 'express';
import jsforce from 'jsforce';
import { getDependencyContainer } from '../dependency_container';
import { IntegrationCreateParams, SafeIntegration } from '../integrations/entities';
import { errorMiddleware as posthogErrorMiddleware, middleware as posthogMiddleware } from '../lib/posthog';

const { integrationService, developerConfigService } = getDependencyContainer();

const router: Router = Router({ mergeParams: true });

router.get(
  '/:integrationId',
  posthogMiddleware('Get Integration'),
  async (req: Request<{ integrationId: string }>, res: Response<SafeIntegration>) => {
    const { integrationId } = req.params;
    const integration = await integrationService.getById(integrationId);

    return res.status(200).send(integration);
  },
  posthogErrorMiddleware('Get Integration')
);

router.get(
  '/',
  posthogMiddleware('Get Integration'),
  async (req: Request<never, any, never, { customerId: string; type: string }>, res: Response<SafeIntegration>) => {
    const { customerId, type } = req.query;
    const integration = await integrationService.getByCustomerIdAndType(customerId, type);

    return res.status(200).send(integration);
  },
  posthogErrorMiddleware('Get Integration')
);

router.post(
  '/',
  posthogMiddleware('Create Integration'),
  async (req: Request<never, any, IntegrationCreateParams>, res: Response<SafeIntegration>): Promise<Response> => {
    const integration = await integrationService.create(req.body);

    return res.status(200).send(integration);
  },
  posthogErrorMiddleware('Create Integration')
);

router.delete(
  '/:integrationId',
  posthogMiddleware('Delete Integration'),
  async (req: Request<{ integrationId: string }>, res: Response<Record<string, never>>) => {
    const integration = await integrationService.getById(req.params.integrationId, /* unsafe */ true);
    const { refreshToken } = integration.credentials;
    const developerConfig = await developerConfigService.getDeveloperConfig();

    // Log out of Salesforce first
    const oauth2 = new jsforce.OAuth2({
      ...developerConfig.getSalesforceCredentials(),
      redirectUri: `${process.env.SUPAGLUE_API_SERVER_URL}/oauth/callback`,
    });
    const connection = new jsforce.Connection({ oauth2, loginUrl: oauth2.loginUrl, refreshToken });
    // TODO: Handle case when user is already logged-out
    await connection.logoutByOAuth2(true);

    // Then delete the integration and all associated syncs
    await integrationService.delete(req.params.integrationId);

    return res.status(204);
  },
  posthogErrorMiddleware('Delete Integration')
);

export default router;
