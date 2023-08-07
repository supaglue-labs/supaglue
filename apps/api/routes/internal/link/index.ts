import { getDependencyContainer } from '@/dependency_container';
import { snakecaseKeys } from '@supaglue/utils';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { magicLinkService } = getDependencyContainer();

export default function init(app: Router): void {
  const linkRouter = Router();

  linkRouter.get('/:link_id', async (req: Request, res: Response) => {
    const magicLink = await magicLinkService.findById(req.params.link_id);
    if (!magicLink) {
      return res.status(200).send({
        code: 'magic_link_not_found',
        error: 'Magic link not found',
      });
    }
    if (magicLink.status !== 'new') {
      return res.status(200).send({
        code: 'magic_link_already_used',
        error: 'Magic link has already been consumed',
      });
    }
    if (magicLink.expiresAt < new Date()) {
      return res.status(200).send({
        code: 'magic_link_expired',
        error: 'Magic link has expired',
      });
    }
    return res.status(200).send({
      code: 'magic_link_valid',
      magic_link: snakecaseKeys(magicLink),
    });
  });

  linkRouter.post('/:link_id/_consume', async (req: Request, res: Response) => {
    await magicLinkService.consumeMagicLink(req.params.link_id);
    return res.status(204).send();
  });

  app.use('/links', linkRouter);
}
