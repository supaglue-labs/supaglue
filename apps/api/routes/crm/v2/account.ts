import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError, NotImplementedError } from '@supaglue/core/errors';
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

const { crmCommonObjectService, managedDataService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<ListAccountsPathParams, ListAccountsResponse, ListAccountsRequest, ListAccountsQueryParams>,
      res: Response<ListAccountsResponse>
    ) => {
      const includeRawData = req.query?.include_raw_data?.toString() === 'true';

      if (req.query?.read_from_cache?.toString() !== 'true') {
        const { pagination, records } = await crmCommonObjectService.list('account', req.customerConnection, {
          modifiedAfter: req.query?.modified_after,
          expand: req.query?.expand,
          includeRawData,
          cursor: req.query?.cursor,
          pageSize: req.query?.page_size ? parseInt(req.query.page_size) : undefined,
          associationsToFetch: req.query?.associations_to_fetch,
        });
        return res.status(200).send({
          pagination,
          records: records.map(toSnakecasedKeysCrmAccount),
        });
      }
      // TODO: Implement expand for uncached reads
      if (req.query?.expand?.length) {
        throw new BadRequestError('Expand is not yet supported for uncached reads');
      }
      return res
        .status(200)
        .send(
          await managedDataService.getCrmAccountRecords(
            req.supaglueApplication.id,
            req.customerConnection.providerName,
            req.customerConnection.id,
            req.customerId,
            req.query?.cursor,
            req.query?.modified_after as unknown as string | undefined,
            req.query?.page_size ? parseInt(req.query.page_size) : undefined,
            includeRawData
          )
        );
    }
  );

  router.get(
    '/:account_id',
    async (
      req: Request<GetAccountPathParams, GetAccountResponse, GetAccountRequest, GetAccountQueryParams>,
      res: Response<GetAccountResponse>
    ) => {
      const account = await crmCommonObjectService.get('account', req.customerConnection, req.params.account_id, {
        includeRawData: req.query?.include_raw_data?.toString() === 'true',
        expand: req.query?.expand,
        associationsToFetch: req.query?.associations_to_fetch,
      });
      const snakecasedKeysAccount = toSnakecasedKeysCrmAccount(account);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysAccount;
      return res.status(200).send(req.query?.include_raw_data?.toString() === 'true' ? snakecasedKeysAccount : rest);
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
      return res.status(201).send({ record: { id } });
    }
  );

  router.post(
    '/_upsert',
    async (
      req: Request<UpsertAccountPathParams, UpsertAccountResponse, UpsertAccountRequest>,
      res: Response<UpsertAccountResponse>
    ) => {
      const id = await crmCommonObjectService.upsert('account', req.customerConnection, {
        record: camelcaseKeysSansCustomFields(req.body.record),
        upsertOn: req.body.upsert_on,
      });
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
    throw new NotImplementedError();
  });

  app.use('/accounts', router);
}
