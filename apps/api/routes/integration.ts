import { Request, Response, Router } from 'express';
import { getDependencyContainer } from '../dependency_container';
import { IntegrationCreateParams, SafeIntegration } from '../integrations/entities';
import { errorMiddleware as posthogErrorMiddleware, middleware as posthogMiddleware } from '../lib/posthog';

const { integrationService } = getDependencyContainer();

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

export default router;
