import { Request, Response, Router } from 'express';
import jsforce from 'jsforce';
import { SALESFORCE } from '../constants';
import { getDependencyContainer } from '../dependency_container';

const router: Router = Router({ mergeParams: true });

const { integrationService, developerConfigService } = getDependencyContainer();

router.get('/salesforce', async (req: Request<never, any, never, { state: string }>, res: Response) => {
  const developerConfig = await developerConfigService.getDeveloperConfig();
  const oauth2 = new jsforce.OAuth2({
    ...developerConfig.getSalesforceCredentials(),
    redirectUri: `${process.env.SUPAGLUE_API_SERVER_URL}/oauth/callback`,
  });
  const { state } = req.query;
  const redirectUrl = oauth2.getAuthorizationUrl({
    scope: 'api id refresh_token',
    state,
  });

  // Always prompt the user to enter their username and password when connecting
  res.redirect(`${redirectUrl}&prompt=login`);
});

router.get('/callback', async (req: Request<never, any, never, { code: string; state: string }>, res: Response) => {
  const developerConfig = await developerConfigService.getDeveloperConfig();
  const oauth2 = new jsforce.OAuth2({
    ...developerConfig.getSalesforceCredentials(),
    redirectUri: `${process.env.SUPAGLUE_API_SERVER_URL}/oauth/callback`,
  });
  const conn = new jsforce.Connection({ oauth2 });
  const { code, state } = req.query;
  if (!code) {
    throw new Error('No code provided');
  }
  if (!state) {
    throw new Error('No state provided');
  }
  const { customerId, returnUrl } = JSON.parse(decodeURIComponent(state));
  if (!returnUrl) {
    throw new Error('No return url provided');
  }

  const userInfo = await conn.authorize(code);

  const { instanceUrl, refreshToken } = conn;
  if (!refreshToken) {
    throw new Error(`Unable to fetch refresh token`);
  }
  const { organizationId } = userInfo;
  await integrationService.create({
    customerId,
    type: SALESFORCE,
    credentials: {
      organizationId,
      refreshToken,
      instanceUrl,
    },
  });
  res.redirect(returnUrl);
});

export default router;
