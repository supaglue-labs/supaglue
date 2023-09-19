import { getDependencyContainer } from '@/dependency_container';
import { NotImplementedError } from '@supaglue/core/errors';
import { toSnakecasedKeysCrmAccount } from '@supaglue/core/mappers/crm';
import type {
  CreateAccountPathParams,
  CreateAccountRequest,
  CreateAccountResponse,
  GetAccountPathParams,
  GetAccountQueryParams,
  GetAccountRequest,
  GetAccountResponse,
  ListAccountsPathParams,
  ListAccountsQueryParams,
  ListAccountsRequest,
  ListAccountsResponse,
  UpdateAccountPathParams,
  UpdateAccountRequest,
  UpdateAccountResponse,
  UpsertAccountPathParams,
  UpsertAccountRequest,
  UpsertAccountResponse,
} from '@supaglue/schemas/v2/crm';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { crmCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<ListAccountsPathParams, ListAccountsResponse, ListAccountsRequest, ListAccountsQueryParams>,
      res: Response<ListAccountsResponse>
    ) => {
      if (req.query.read_from_cache !== 'true') {
        throw new NotImplementedError('Uncached reads not yet implemented for accounts.');
      }
      return res.status(200).send({
        pagination: {
          next: null,
          previous: null,
          total_count: 0,
        },
        records: [],
      });
    }
  );

  router.get(
    '/:account_id',
    async (
      req: Request<GetAccountPathParams, GetAccountResponse, GetAccountRequest, GetAccountQueryParams>,
      res: Response<GetAccountResponse>
    ) => {
      const account = await crmCommonObjectService.get('account', req.customerConnection, req.params.account_id);
      const snakecasedKeysAccount = toSnakecasedKeysCrmAccount(account);
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
      const id = await crmCommonObjectService.create(
        'account',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body.record)
      );
      return res.status(200).send({ record: { id } });
    }
  );

  router.post(
    '/_upsert',
    async (
      req: Request<UpsertAccountPathParams, UpsertAccountResponse, UpsertAccountRequest>,
      res: Response<UpsertAccountResponse>
    ) => {
      const id = await crmCommonObjectService.upsert(
        'account',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body)
      );
      return res.status(200).send({ record: { id } });
    }
  );

  router.patch(
    '/:account_id',
    async (
      req: Request<UpdateAccountPathParams, UpdateAccountResponse, UpdateAccountRequest>,
      res: Response<UpdateAccountResponse>
    ) => {
      await crmCommonObjectService.update('account', req.customerConnection, {
        id: req.params.account_id,
        ...camelcaseKeysSansCustomFields(req.body.record),
      });
      return res.status(200).send({});
    }
  );

  router.delete('/:account_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/accounts', router);
}
