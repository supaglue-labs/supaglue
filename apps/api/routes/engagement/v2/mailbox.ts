import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError, NotImplementedError } from '@supaglue/core/errors';
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
} from '@supaglue/schemas/v2/engagement';
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
      const { id: connectionId } = req.customerConnection;
      const mailbox = await engagementCommonObjectService.get('mailbox', connectionId, req.params.mailbox_id);
      const snakecasedKeysMailbox = toSnakecasedKeysMailbox(mailbox);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysMailbox;
      return res.status(200).send(req.query?.include_raw_data ? snakecasedKeysMailbox : rest);
    }
  );

  router.get(
    '/',
    async (
      req: Request<ListMailboxesPathParams, ListMailboxesResponse, ListMailboxesRequest, ListMailboxesQueryParams>,
      res: Response<ListMailboxesResponse>
    ) => {
      if (req.query?.read_from_cache?.toString() !== 'true') {
        throw new BadRequestError('Uncached reads not yet implemented for mailboxes.');
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
          raw_data: req.query?.include_raw_data ? record.raw_data : undefined,
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
