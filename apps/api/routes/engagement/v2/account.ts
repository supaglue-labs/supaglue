import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError } from '@supaglue/core/errors';
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
  UpdateAccountPathParams,
  UpdateAccountQueryParams,
  UpdateAccountRequest,
  UpdateAccountResponse,
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
      const { id: connectionId } = req.customerConnection;
      const account = await engagementCommonObjectService.get('account', connectionId, req.params.account_id);
      const snakecasedKeysAccount = toSnakecasedKeysEngagementAccount(account);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysAccount;
      return res.status(200).send(req.query?.include_raw_data ? snakecasedKeysAccount : rest);
    }
  );

  router.get(
    '/',
    async (
      req: Request<ListAccountsPathParams, ListAccountsResponse, ListAccountsRequest, ListAccountsQueryParams>,
      res: Response<ListAccountsResponse>
    ) => {
      if (req.query?.read_from_cache?.toString() !== 'true') {
        throw new BadRequestError('Uncached reads not yet implemented for accounts.');
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
          raw_data: req.query?.include_raw_data ? record.raw_data : undefined,
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
    throw new Error('Not implemented');
  });

  app.use('/accounts', router);
}
