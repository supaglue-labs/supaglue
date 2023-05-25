import { GetUserPathParams, GetUserRequest, GetUserResponse } from '@supaglue/schemas/v2/crm';
import { Request, Response, Router } from 'express';

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:user_id',
    async (req: Request<GetUserPathParams, GetUserResponse, GetUserRequest>, res: Response<GetUserResponse>) => {
      throw new Error('Not implemented');
    }
  );

  app.use('/users', router);
}
