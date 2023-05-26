import { getDependencyContainer } from '@/dependency_container';
import { toSnakecasedKeysCrmAccountV2 } from '@supaglue/core/mappers/crm';
import {
  CreateAccountPathParams,
  CreateAccountRequest,
  CreateAccountResponse,
  GetAccountPathParams,
  GetAccountQueryParams,
  GetAccountRequest,
  GetAccountResponse,
  UpdateAccountPathParams,
  UpdateAccountRequest,
  UpdateAccountResponse,
} from '@supaglue/schemas/v2/crm';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import { Request, Response, Router } from 'express';

const { crmCommonModelService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:account_id',
    async (
      req: Request<GetAccountPathParams, GetAccountResponse, GetAccountRequest, GetAccountQueryParams>,
      res: Response<GetAccountResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const account = await crmCommonModelService.get('account', connectionId, req.params.account_id);
      const snakecasedKeysAccount = toSnakecasedKeysCrmAccountV2(account);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysAccount;
      return res.status(200).send(req.query.include_raw_data === 'true' ? snakecasedKeysAccount : rest);
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateAccountPathParams, CreateAccountResponse, CreateAccountRequest>,
      res: Response<CreateAccountResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const id = await crmCommonModelService.create(
        'account',
        connectionId,
        camelcaseKeysSansCustomFields(req.body.model)
      );
      return res.status(200).send({ model: { id } });
    }
  );

  router.patch(
    '/:account_id',
    async (
      req: Request<UpdateAccountPathParams, UpdateAccountResponse, UpdateAccountRequest>,
      res: Response<UpdateAccountResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      await crmCommonModelService.update('account', connectionId, {
        id: req.params.account_id,
        ...camelcaseKeysSansCustomFields(req.body.model),
      });
      return res.status(200).send({});
    }
  );

  router.delete('/:account_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/accounts', router);
}
