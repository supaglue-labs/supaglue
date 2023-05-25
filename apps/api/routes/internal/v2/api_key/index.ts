import { getDependencyContainer } from '@/dependency_container';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';

const { applicationService } = getDependencyContainer();

export default function init(app: Router): void {
  const apiKeysRouter = Router();

  apiKeysRouter.post('/_generate_api_key', async (req: Request, res: Response) => {
    const applicationId = req.supaglueApplication.id;

    // TODO: move to its own object and support multiple API keys
    const updatedApplication = await applicationService.createApiKey(applicationId, req.supaglueApplication);
    return res.status(200).send(snakecaseKeys({ apiKey: updatedApplication.config.apiKey }));
  });

  apiKeysRouter.post('/_revoke_api_key', async (req: Request, res: Response) => {
    const applicationId = req.supaglueApplication.id;

    // TODO: move to its own object and support multiple API keys
    await applicationService.deleteApiKey(applicationId, req.supaglueApplication);
    return res.status(200).send(snakecaseKeys({ apiKey: null }));
  });

  app.use('/api_keys', apiKeysRouter);
}
