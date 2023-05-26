import { getDependencyContainer } from '@/dependency_container';
import { toSnakecasedKeysCrmUserV2 } from '@supaglue/core/mappers/crm';
import { GetUserPathParams, GetUserQueryParams, GetUserRequest, GetUserResponse } from '@supaglue/schemas/v2/crm';
import { Request, Response, Router } from 'express';

const { crmCommonModelService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:user_id',
    async (
      req: Request<GetUserPathParams, GetUserResponse, GetUserRequest, GetUserQueryParams>,
      res: Response<GetUserResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const user = await crmCommonModelService.get('user', connectionId, req.params.user_id);
      const snakecasedKeysUser = toSnakecasedKeysCrmUserV2(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysUser;
      return res.status(200).send(req.query.include_raw_data === 'true' ? snakecasedKeysUser : rest);
    }
  );

  app.use('/users', router);
}
