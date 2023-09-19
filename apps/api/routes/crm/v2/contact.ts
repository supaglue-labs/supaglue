import { getDependencyContainer } from '@/dependency_container';
import { NotImplementedError } from '@supaglue/core/errors';
import { toSnakecasedKeysCrmContact } from '@supaglue/core/mappers/crm';
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
  UpsertContactPathParams,
  UpsertContactRequest,
  UpsertContactResponse,
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
      req: Request<ListContactsPathParams, ListContactsResponse, ListContactsRequest, ListContactsQueryParams>,
      res: Response<ListContactsResponse>
    ) => {
      if (req.query.read_from_cache !== 'true') {
        throw new NotImplementedError('Uncached reads not yet implemented for contacts.');
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
    '/:contact_id',
    async (
      req: Request<GetContactPathParams, GetContactResponse, GetContactRequest, GetContactQueryParams>,
      res: Response<GetContactResponse>
    ) => {
      const contact = await crmCommonObjectService.get('contact', req.customerConnection, req.params.contact_id);
      const snakecasedKeysContact = toSnakecasedKeysCrmContact(contact);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysContact;
      return res.status(200).send(req.query.include_raw_data === 'true' ? snakecasedKeysContact : rest);
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateContactPathParams, CreateContactResponse, CreateContactRequest>,
      res: Response<CreateContactResponse>
    ) => {
      const id = await crmCommonObjectService.create(
        'contact',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body.record)
      );
      return res.status(200).send({ record: { id } });
    }
  );

  router.post(
    '/_upsert',
    async (
      req: Request<UpsertContactPathParams, UpsertContactResponse, UpsertContactRequest>,
      res: Response<UpsertContactResponse>
    ) => {
      const id = await crmCommonObjectService.upsert(
        'contact',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body)
      );
      return res.status(200).send({ record: { id } });
    }
  );

  router.patch<string, UpdateContactPathParams, UpdateContactResponse, UpdateContactRequest, UpdateContactQueryParams>(
    '/:contact_id',
    async (
      req: Request<UpdateContactPathParams, UpdateContactResponse, UpdateContactRequest>,
      res: Response<UpdateContactResponse>
    ) => {
      await crmCommonObjectService.update('contact', req.customerConnection, {
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
