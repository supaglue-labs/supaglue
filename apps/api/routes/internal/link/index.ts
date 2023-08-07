import { getDependencyContainer } from '@/dependency_container';
import { NotImplementedError } from '@supaglue/core/errors';
import { snakecaseKeys } from '@supaglue/utils';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { magicLinkService } = getDependencyContainer();

export default function init(app: Router): void {
  const linkRouter = Router();

  linkRouter.get('/:link_id', async (req: Request, res: Response) => {
    const magicLink = await magicLinkService.getById(req.params.link_id);
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

  linkRouter.post('/_consume', async (req: Request, res: Response) => {
    throw new NotImplementedError('Not implemented');
  });

  app.use('/links', linkRouter);
}
