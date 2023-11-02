import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError } from '@supaglue/core/errors';
import { toSnakecasedKeysEngagementContact } from '@supaglue/core/mappers/engagement';
import type {
  CreateContactPathParams,
  CreateContactRequest,
  CreateContactResponse,
  GetContactPathParams,
  GetContactQueryParams,
  GetContactRequest,
  GetContactResponse,
  ListContactsPathParams,
  ListContactsQueryParams,
  ListContactsRequest,
  ListContactsResponse,
  UpdateContactPathParams,
  UpdateContactQueryParams,
  UpdateContactRequest,
  UpdateContactResponse,
} from '@supaglue/schemas/v2/engagement';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { engagementCommonObjectService, managedDataService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:contact_id',
    async (
      req: Request<GetContactPathParams, GetContactResponse, GetContactRequest, GetContactQueryParams>,
      res: Response<GetContactResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const contact = await engagementCommonObjectService.get('contact', connectionId, req.params.contact_id);
      const snakecasedKeysContact = toSnakecasedKeysEngagementContact(contact);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysContact;
      return res.status(200).send(req.query?.include_raw_data ? snakecasedKeysContact : rest);
    }
  );

  router.get(
    '/',
    async (
      req: Request<ListContactsPathParams, ListContactsResponse, ListContactsRequest, ListContactsQueryParams>,
      res: Response<ListContactsResponse>
    ) => {
      if (req.query?.read_from_cache?.toString() !== 'true') {
        throw new BadRequestError('Uncached reads not yet implemented for contacts.');
      }
      const includeRawData = req.query?.include_raw_data?.toString() === 'true';
      const { pagination, records } = await managedDataService.getEngagementContactRecords(
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
      req: Request<CreateContactPathParams, CreateContactResponse, CreateContactRequest>,
      res: Response<CreateContactResponse>
    ) => {
      const id = await engagementCommonObjectService.create(
        'contact',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body.record)
      );
      return res.status(201).send({ record: { id } });
    }
  );

  router.patch<string, UpdateContactPathParams, UpdateContactResponse, UpdateContactRequest, UpdateContactQueryParams>(
    '/:contact_id',
    async (
      req: Request<UpdateContactPathParams, UpdateContactResponse, UpdateContactRequest>,
      res: Response<UpdateContactResponse>
    ) => {
      await engagementCommonObjectService.update('contact', req.customerConnection, {
        id: req.params.contact_id,
        ...camelcaseKeysSansCustomFields(req.body.record),
      });
      return res.status(200).send({});
    }
  );

  router.delete('/:contact_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/contacts', router);
}
