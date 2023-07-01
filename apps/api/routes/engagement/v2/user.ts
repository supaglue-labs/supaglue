import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError } from '@supaglue/core/errors';
import { toSnakecasedKeysEngagementUser } from '@supaglue/core/mappers/engagement';
import type { GetUserPathParams, GetUserRequest, GetUserResponse } from '@supaglue/schemas/v2/engagement';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { engagementCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:user_id',
    async (req: Request<GetUserPathParams, GetUserResponse, GetUserRequest>, res: Response<GetUserResponse>) => {
      const { id: connectionId } = req.customerConnection;
      const user = await engagementCommonObjectService.get('user', connectionId, req.params.user_id);
      const snakecasedKeysUser = toSnakecasedKeysEngagementUser(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysUser;
      return res.status(200).send(req.query.include_raw_data === 'true' ? snakecasedKeysUser : rest);
    }
  );

  router.post('/', async (req: Request, res: Response) => {
    throw new BadRequestError('POST not supported for /users');
  });

  router.patch('/:mailbox_id', async (req: Request, res: Response) => {
    throw new BadRequestError('PATCH not supported for /users');
  });

  app.use('/users', router);
}
