import { getDependencyContainer } from '@/dependency_container';
import { NotImplementedError } from '@supaglue/core/errors';
import { toSnakecasedKeysMailbox } from '@supaglue/core/mappers/engagement';
import type {
  GetMailboxPathParams,
  GetMailboxQueryParams,
  GetMailboxRequest,
  GetMailboxResponse,
  ListMailboxesPathParams,
  ListMailboxesQueryParams,
  ListMailboxesRequest,
  ListMailboxesResponse,
} from '@supaglue/sdk/v2/engagement';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { engagementCommonObjectService, managedDataService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:mailbox_id',
    async (
      req: Request<GetMailboxPathParams, GetMailboxResponse, GetMailboxRequest, GetMailboxQueryParams>,
      res: Response<GetMailboxResponse>
    ) => {
      const includeRawData = req.query?.include_raw_data?.toString() === 'true';
      const { id: connectionId } = req.customerConnection;
      const mailbox = await engagementCommonObjectService.get('mailbox', connectionId, req.params.mailbox_id);
      const snakecasedKeysMailbox = toSnakecasedKeysMailbox(mailbox);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysMailbox;
      return res.status(200).send(includeRawData ? snakecasedKeysMailbox : rest);
    }
  );

  router.get(
    '/',
    async (
      req: Request<ListMailboxesPathParams, ListMailboxesResponse, ListMailboxesRequest, ListMailboxesQueryParams>,
      res: Response<ListMailboxesResponse>
    ) => {
      const includeRawData = req.query?.include_raw_data?.toString() === 'true';
      if (req.query?.read_from_cache?.toString() !== 'true') {
        const { pagination, records } = await engagementCommonObjectService.list('mailbox', req.customerConnection, {
          modifiedAfter: req.query?.modified_after,
          cursor: req.query?.cursor,
          pageSize: req.query?.page_size ? parseInt(req.query.page_size) : undefined,
        });
        return res.status(200).send({
          pagination,
          records: records.map((record) => ({
            ...toSnakecasedKeysMailbox(record),
            raw_data: includeRawData ? record.rawData : undefined,
          })),
        });
      }
      const { pagination, records } = await managedDataService.getEngagementMailboxRecords(
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

  router.post('/', async (req: Request, res: Response) => {
    throw new NotImplementedError();
  });

  router.patch('/:mailbox_id', async (req: Request, res: Response) => {
    throw new NotImplementedError();
  });

  app.use('/mailboxes', router);
}
