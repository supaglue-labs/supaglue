import { Request, Response, Router } from 'express';
import { getDependencyContainer } from '../dependency_container';
import { DeveloperConfigSpec } from '../developer_config/entities';
import { errorMiddleware as posthogErrorMiddleware, middleware as posthogMiddleware } from '../lib/posthog';

const { developerConfigService } = getDependencyContainer();

const router: Router = Router({ mergeParams: true });

router.get(
  '/',
  posthogMiddleware('Get Developer Config'),
  async (req: Request, res: Response<DeveloperConfigSpec>) => {
    const developerConfig = await developerConfigService.findDeveloperConfig();
    const spec = developerConfig?.getSpec();

    return res.status(200).send(spec);
  },
  posthogErrorMiddleware('Get Developer Config')
);

router.put(
  '/',
  posthogMiddleware('Update Developer Config'),
  async (req: Request, res: Response<DeveloperConfigSpec>) => {
    const developerConfig = await developerConfigService.updateDeveloperConfig(req.body);
    const spec = developerConfig.getSpec();

    return res.status(200).send(spec);
  },
  posthogErrorMiddleware('Update Developer Config')
);

router.post(
  '/',
  posthogMiddleware('Create Developer Config'),
  async (req: Request, res: Response<DeveloperConfigSpec>) => {
    const developerConfig = await developerConfigService.createDeveloperConfig(req.body);
    const spec = developerConfig.getSpec();

    return res.status(200).send(spec);
  },
  posthogErrorMiddleware('Create Developer Config')
);

export default router;
