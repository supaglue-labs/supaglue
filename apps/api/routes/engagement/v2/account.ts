import { getDependencyContainer } from '@/dependency_container';
import { NotImplementedError } from '@supaglue/core/errors';
import { toSnakecasedKeysEngagementAccount } from '@supaglue/core/mappers/engagement';
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
  SearchAccountsPathParams,
  SearchAccountsQueryParams,
  SearchAccountsRequest,
  SearchAccountsResponse,
  UpdateAccountPathParams,
  UpdateAccountQueryParams,
  UpdateAccountRequest,
  UpdateAccountResponse,
  UpsertAccountPathParams,
  UpsertAccountRequest,
  UpsertAccountResponse,
} from '@supaglue/schemas/v2/engagement';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { engagementCommonObjectService, managedDataService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:account_id',
    async (
      req: Request<GetAccountPathParams, GetAccountResponse, GetAccountRequest, GetAccountQueryParams>,
      res: Response<GetAccountResponse>
    ) => {
      const includeRawData = req.query?.include_raw_data?.toString() === 'true';
      const { id: connectionId } = req.customerConnection;
      const account = await engagementCommonObjectService.get('account', connectionId, req.params.account_id);
      const snakecasedKeysAccount = toSnakecasedKeysEngagementAccount(account);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysAccount;
      return res.status(200).send(includeRawData ? snakecasedKeysAccount : rest);
    }
  );

  router.get(
    '/',
    async (
      req: Request<ListAccountsPathParams, ListAccountsResponse, ListAccountsRequest, ListAccountsQueryParams>,
      res: Response<ListAccountsResponse>
    ) => {
      const includeRawData = req.query?.include_raw_data?.toString() === 'true';
      if (req.query?.read_from_cache?.toString() !== 'true') {
        const { pagination, records } = await engagementCommonObjectService.list('account', req.customerConnection, {
          modifiedAfter: req.query?.modified_after,
          cursor: req.query?.cursor,
          pageSize: req.query?.page_size ? parseInt(req.query.page_size) : undefined,
        });
        return res.status(200).send({
          pagination,
          records: records.map((record) => ({
            ...toSnakecasedKeysEngagementAccount(record),
            raw_data: includeRawData ? record.rawData : undefined,
          })),
        });
      }
      const { pagination, records } = await managedDataService.getEngagementAccountRecords(
        req.supaglueApplication.id,
        req.customerConnection.providerName,
        req.customerId,
        req.query?.cursor,
        req.query?.modified_after as unknown as string | undefined,
        req.query?.page_size ? parseInt(req.query.page_size) : undefined
      );
      return res.status(200).send({
        pagination,
        records: records.map((record) => ({
          ...record,
          raw_data: includeRawData ? record.raw_data : undefined,
          _supaglue_application_id: undefined,
          _supaglue_customer_id: undefined,
          _supaglue_provider_name: undefined,
          _supaglue_emitted_at: undefined,
        })),
      });
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateAccountPathParams, CreateAccountResponse, CreateAccountRequest>,
      res: Response<CreateAccountResponse>
    ) => {
      const id = await engagementCommonObjectService.create(
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
      const id = await engagementCommonObjectService.upsert(
        'account',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body)
      );
      return res.status(201).send({ record: { id } });
    }
  );

  router.post(
    '/_search',
    async (
      req: Request<SearchAccountsPathParams, SearchAccountsResponse, SearchAccountsRequest, SearchAccountsQueryParams>,
      res: Response<SearchAccountsResponse>
    ) => {
      const { pagination, records } = await engagementCommonObjectService.search(
        'account',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body)
      );
      return res.status(200).send({
        pagination,
        records: records.map((record) => {
          const snakecased = toSnakecasedKeysEngagementAccount(record);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { raw_data, ...rest } = snakecased;
          return req.query?.include_raw_data?.toString() === 'true' ? snakecased : rest;
        }),
      });
    }
  );

  router.patch<string, UpdateAccountPathParams, UpdateAccountResponse, UpdateAccountRequest, UpdateAccountQueryParams>(
    '/:account_id',
    async (
      req: Request<UpdateAccountPathParams, UpdateAccountResponse, UpdateAccountRequest>,
      res: Response<UpdateAccountResponse>
    ) => {
      await engagementCommonObjectService.update('account', req.customerConnection, {
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
