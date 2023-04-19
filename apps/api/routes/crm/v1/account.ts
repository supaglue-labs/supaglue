import { getDependencyContainer } from '@/dependency_container';
import { toSnakecasedKeysAccount } from '@supaglue/core/mappers';
import {
  CreateAccountPathParams,
  CreateAccountRequest,
  CreateAccountResponse,
  UpdateAccountPathParams,
  UpdateAccountRequest,
  UpdateAccountResponse,
} from '@supaglue/schemas/crm';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import { Request, Response, Router } from 'express';

const { accountService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.post(
    '/',
    async (
      req: Request<CreateAccountPathParams, CreateAccountResponse, CreateAccountRequest>,
      res: Response<CreateAccountResponse>
    ) => {
      const { customerId, id: connectionId } = req.customerConnection;
      const account = await accountService.create(
        customerId,
        connectionId,
        camelcaseKeysSansCustomFields(req.body.model)
      );
      return res.status(200).send({ model: toSnakecasedKeysAccount(account) });
    }
  );

  router.patch(
    '/:account_id',
    async (
      req: Request<UpdateAccountPathParams, UpdateAccountResponse, UpdateAccountRequest>,
      res: Response<UpdateAccountResponse>
    ) => {
      const { customerId, id: connectionId } = req.customerConnection;
      const account = await accountService.update(customerId, connectionId, {
        id: req.params.account_id,
        ...camelcaseKeysSansCustomFields(req.body.model),
      });
      return res.status(200).send({ model: toSnakecasedKeysAccount(account) });
    }
  );

  app.use('/accounts', router);
}
