import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError } from '@supaglue/core/errors';
import { toSnakecasedKeysEngagementUserV2 } from '@supaglue/core/mappers/engagement';
import { GetUserPathParams, GetUserRequest, GetUserResponse } from '@supaglue/schemas/v2/engagement';
import { Request, Response, Router } from 'express';

const { engagementCommonModelService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:user_id',
    async (req: Request<GetUserPathParams, GetUserResponse, GetUserRequest>, res: Response<GetUserResponse>) => {
      const { id: connectionId } = req.customerConnection;
      const user = await engagementCommonModelService.get('user', connectionId, req.params.user_id);
      const snakecasedKeysUser = toSnakecasedKeysEngagementUserV2(user);
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
