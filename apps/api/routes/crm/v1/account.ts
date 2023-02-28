import { getDependencyContainer } from '@/dependency_container';
import { camelcaseKeys } from '@/lib/camelcase';
import { snakecaseKeys } from '@/lib/snakecase';
import { GetParams, ListParams } from '@supaglue/core/types/common';
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
  UpdateAccountPathParams,
  UpdateAccountRequest,
  UpdateAccountResponse,
} from '@supaglue/schemas/crm';
import { Request, Response, Router } from 'express';

const { accountService } = getDependencyContainer();

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
      const { next, previous, results } = await accountService.list(req.customerConnection.id, req.query);

      const snakeCaseKeysResults = results.map((result) => {
        return snakecaseKeys(result);
      });

      return res.status(200).send({ next, previous, results: snakeCaseKeysResults });
    }
  );

  router.get(
    '/:account_id',
    async (
      req: Request<GetAccountPathParams, GetAccountResponse, GetAccountRequest, /* GetAccountQueryParams */ GetParams>,
      res: Response<GetAccountResponse>
    ) => {
      const account = await accountService.getById(req.params.account_id, req.customerConnection.id, req.query);
      return res.status(200).send(snakecaseKeys(account));
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateAccountPathParams, CreateAccountResponse, CreateAccountRequest>,
      res: Response<CreateAccountResponse>
    ) => {
      const { customerId, id: connectionId } = req.customerConnection;
      const account = await accountService.create(customerId, connectionId, camelcaseKeys(req.body.model));
      return res.status(200).send({ model: snakecaseKeys(account) });
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
        ...camelcaseKeys(req.body.model),
      });
      return res.status(200).send({ model: snakecaseKeys(account) });
    }
  );

  router.delete('/:account_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/accounts', router);
}
