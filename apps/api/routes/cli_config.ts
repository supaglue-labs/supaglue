import { Request, Response, Router } from 'express';

const router: Router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response<{ posthogApiKey?: string }>) => {
  return res.status(200).send({ posthogApiKey: process.env.SUPAGLUE_POSTHOG_API_KEY });
});

export default router;
