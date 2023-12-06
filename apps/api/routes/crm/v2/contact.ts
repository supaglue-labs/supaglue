import { getDependencyContainer } from '@/dependency_container';
import { NotImplementedError } from '@supaglue/core/errors';
import { toSnakecasedKeysCrmContact } from '@supaglue/core/mappers/crm';
import { toMappedProperties } from '@supaglue/core/remotes/utils/properties';
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
  SearchContactsPathParams,
  SearchContactsQueryParams,
  SearchContactsRequest,
  SearchContactsResponse,
  UpdateContactPathParams,
  UpdateContactRequest,
  UpdateContactResponse,
  UpsertContactPathParams,
  UpsertContactRequest,
  UpsertContactResponse,
} from '@supaglue/sdk/v2/crm';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import { camelcaseKeys, camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { crmCommonObjectService, managedDataService, connectionService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<ListContactsPathParams, ListContactsResponse, ListContactsRequest, ListContactsQueryParams>,
      res: Response<ListContactsResponse>
    ) => {
      const includeRawData = req.query?.include_raw_data?.toString() === 'true';
      if (req.query?.read_from_cache?.toString() !== 'true') {
        const { pagination, records } = await crmCommonObjectService.list('contact', req.customerConnection, {
          modifiedAfter: req.query?.modified_after,
          cursor: req.query?.cursor,
          pageSize: req.query?.page_size ? parseInt(req.query.page_size) : undefined,
          associationsToFetch: req.query?.associations_to_fetch,
        });
        return res.status(200).send({
          pagination,
          records: records.map((record) => ({
            ...toSnakecasedKeysCrmContact(record),
            raw_data: includeRawData ? record.rawData : undefined,
          })),
        });
      }
      const { pagination, records } = await managedDataService.getCrmContactRecords(
        req.supaglueApplication.id,
        req.customerConnection.providerName,
        req.customerId,
        req.query?.cursor,
        req.query?.modified_after as unknown as string | undefined,
        req.query?.page_size ? parseInt(req.query.page_size) : undefined
      );
      let fieldMappingConfig: FieldMappingConfig | undefined = undefined;
      if (includeRawData) {
        fieldMappingConfig = await connectionService.getFieldMappingConfig(
          req.customerConnection.id,
          'common',
          'contact'
        );
      }
      return res.status(200).send({
        pagination,
        records: records.map((record) => ({
          ...record,
          raw_data:
            includeRawData && fieldMappingConfig ? toMappedProperties(record.raw_data, fieldMappingConfig) : undefined,
          _supaglue_application_id: undefined,
          _supaglue_customer_id: undefined,
          _supaglue_provider_name: undefined,
          _supaglue_emitted_at: undefined,
        })),
      });
    }
  );

  router.get(
    '/:contact_id',
    async (
      req: Request<GetContactPathParams, GetContactResponse, GetContactRequest, GetContactQueryParams>,
      res: Response<GetContactResponse>
    ) => {
      const contact = await crmCommonObjectService.get(
        'contact',
        req.customerConnection,
        req.params.contact_id,
        req.query?.associations_to_fetch
      );
      const snakecasedKeysContact = toSnakecasedKeysCrmContact(contact);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysContact;
      return res.status(200).send(req.query?.include_raw_data?.toString() === 'true' ? snakecasedKeysContact : rest);
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
      return res.status(201).send({ record: { id } });
    }
  );

  router.post(
    '/_upsert',
    async (
      req: Request<UpsertContactPathParams, UpsertContactResponse, UpsertContactRequest>,
      res: Response<UpsertContactResponse>
    ) => {
      const id = await crmCommonObjectService.upsert('contact', req.customerConnection, {
        record: camelcaseKeysSansCustomFields(req.body.record),
        upsertOn: camelcaseKeys(req.body.upsert_on),
      });
      return res.status(200).send({ record: { id } });
    }
  );

  router.post(
    '/_search',
    async (
      req: Request<SearchContactsPathParams, SearchContactsResponse, SearchContactsRequest, SearchContactsQueryParams>,
      res: Response<SearchContactsResponse>
    ) => {
      const { pagination, records } = await crmCommonObjectService.search('contact', req.customerConnection, {
        filter: req.body.filter,
        cursor: req.query?.cursor,
        pageSize: req.query?.page_size ? parseInt(req.query.page_size) : undefined,
        associationsToFetch: req.query?.associations_to_fetch,
      });
      return res.status(200).send({
        pagination,
        records: records.map((record) => {
          const snakecased = toSnakecasedKeysCrmContact(record);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { raw_data, ...rest } = snakecased;
          return req.query?.include_raw_data?.toString() === 'true' ? snakecased : rest;
        }),
      });
    }
  );

  router.patch(
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
    throw new NotImplementedError();
  });

  app.use('/contacts', router);
}
