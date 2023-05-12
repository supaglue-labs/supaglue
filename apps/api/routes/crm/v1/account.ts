import { getDependencyContainer } from '@/dependency_container';
import { toSearchInternalParams } from '@supaglue/core/mappers';
import { toSnakecasedKeysAccount } from '@supaglue/core/mappers/crm';
import { toGetInternalParams, toListInternalParams } from '@supaglue/core/mappers/params';
import {
  CreateAccountPathParams,
  CreateAccountRequest,
  CreateAccountResponse,
  GetAccountPathParams,
  GetAccountRequest,
  GetAccountResponse,
  GetAccountsPathParams,
  GetAccountsRequest,
  GetAccountsResponse,
  SearchAccountsPathParams,
  SearchAccountsRequest,
  SearchAccountsResponse,
  UpdateAccountPathParams,
  UpdateAccountRequest,
  UpdateAccountResponse,
} from '@supaglue/schemas/crm';
import { ListParams } from '@supaglue/types';
import { camelcaseKeys, camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import { Request, Response, Router } from 'express';

const {
  crm: { accountService },
} = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<
        GetAccountsPathParams,
        GetAccountsResponse,
        GetAccountsRequest,
        /* GetAccountsQueryParams */ ListParams
      >,
      res: Response<GetAccountsResponse>
    ) => {
      const { next, previous, results } = await accountService.list(
        req.customerConnection.id,
        toListInternalParams(req.query)
      );

      const snakeCaseKeysResults = results.map(toSnakecasedKeysAccount);

      return res.status(200).send({ next, previous, results: snakeCaseKeysResults });
    }
  );

  router.get(
    '/:account_id',
    async (
      req: Request<GetAccountPathParams, GetAccountResponse, GetAccountRequest>,
      res: Response<GetAccountResponse>
    ) => {
      const account = await accountService.getById(
        req.params.account_id,
        req.customerConnection.id,
        toGetInternalParams(req.query)
      );
      return res.status(200).send(toSnakecasedKeysAccount(account));
    }
  );

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

  router.post(
    '/_search',
    async (
      req: Request<SearchAccountsPathParams, SearchAccountsResponse, SearchAccountsRequest>,
      res: Response<SearchAccountsResponse>
    ) => {
      const { next, previous, results } = await accountService.search(
        req.customerConnection.id,
        toSearchInternalParams(req.query),
        camelcaseKeys(req.body.filters)
      );

      const snakeCaseKeysResults = results.map(toSnakecasedKeysAccount);

      return res.status(200).send({ next, previous, results: snakeCaseKeysResults });
    }
  );

  router.delete('/:account_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/accounts', router);
}
