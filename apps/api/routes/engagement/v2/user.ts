import { getDependencyContainer } from '@/dependency_container';
import {
  GetUserPathParams,
  GetUserRequest,
  GetUserResponse,
  GetUsersPathParams,
  GetUsersRequest,
  GetUsersResponse,
} from '@supaglue/schemas/v2/engagement';
import { ListParams } from '@supaglue/types/common';
import { Request, Response, Router } from 'express';

const {
  engagement: { userService },
} = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<GetUsersPathParams, GetUsersResponse, GetUsersRequest, /* GetUsersQueryParams */ ListParams>,
      res: Response<GetUsersResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  router.get(
    '/:user_id',
    async (req: Request<GetUserPathParams, GetUserResponse, GetUserRequest>, res: Response<GetUserResponse>) => {
      throw new Error('Not implemented');
    }
  );

  app.use('/users', router);
}
