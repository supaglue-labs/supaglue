import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError } from '@supaglue/core/errors';
import { toSnakecasedKeysCrmLead } from '@supaglue/core/mappers/crm';
import { toMappedProperties } from '@supaglue/core/remotes/utils/properties';
import type {
  CreateLeadPathParams,
  CreateLeadRequest,
  CreateLeadResponse,
  GetLeadPathParams,
  GetLeadQueryParams,
  GetLeadRequest,
  GetLeadResponse,
  ListLeadsPathParams,
  ListLeadsQueryParams,
  ListLeadsRequest,
  ListLeadsResponse,
  SearchLeadsPathParams,
  SearchLeadsQueryParams,
  SearchLeadsRequest,
  SearchLeadsResponse,
  UpdateLeadPathParams,
  UpdateLeadRequest,
  UpdateLeadResponse,
  UpsertLeadPathParams,
  UpsertLeadRequest,
  UpsertLeadResponse,
} from '@supaglue/schemas/v2/crm';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import { camelcaseKeys, camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { crmCommonObjectService, managedDataService, connectionService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:lead_id',
    async (
      req: Request<GetLeadPathParams, GetLeadResponse, GetLeadRequest, GetLeadQueryParams>,
      res: Response<GetLeadResponse>
    ) => {
      const lead = await crmCommonObjectService.get('lead', req.customerConnection, req.params.lead_id);
      const snakecasedKeysLead = toSnakecasedKeysCrmLead(lead);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysLead;
      return res.status(200).send(req.query?.include_raw_data?.toString() === 'true' ? snakecasedKeysLead : rest);
    }
  );

  router.get(
    '/',
    async (
      req: Request<ListLeadsPathParams, ListLeadsResponse, ListLeadsRequest, ListLeadsQueryParams>,
      res: Response<ListLeadsResponse>
    ) => {
      if (req.query?.read_from_cache?.toString() !== 'true') {
        throw new BadRequestError('Uncached reads not yet implemented for leads.');
      }
      const includeRawData = req.query?.include_raw_data?.toString() === 'true';
      const { pagination, records } = await managedDataService.getCrmLeadRecords(
        req.supaglueApplication.id,
        req.customerConnection.providerName,
        req.customerId,
        req.query?.cursor,
        req.query?.modified_after as unknown as string | undefined,
        req.query?.page_size ? parseInt(req.query.page_size) : undefined
      );
      let fieldMappingConfig: FieldMappingConfig | undefined = undefined;
      if (includeRawData) {
        fieldMappingConfig = await connectionService.getFieldMappingConfig(req.customerConnection.id, 'common', 'lead');
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

  router.post(
    '/',
    async (
      req: Request<CreateLeadPathParams, CreateLeadResponse, CreateLeadRequest>,
      res: Response<CreateLeadResponse>
    ) => {
      const id = await crmCommonObjectService.create(
        'lead',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body.record)
      );
      return res.status(201).send({ record: { id } });
    }
  );

  router.patch(
    '/:lead_id',
    async (
      req: Request<UpdateLeadPathParams, UpdateLeadResponse, UpdateLeadRequest>,
      res: Response<UpdateLeadResponse>
    ) => {
      await crmCommonObjectService.update('lead', req.customerConnection, {
        id: req.params.lead_id,
        ...camelcaseKeysSansCustomFields(req.body.record),
      });
      return res.status(200).send({});
    }
  );

  router.post(
    '/_upsert',
    async (
      req: Request<UpsertLeadPathParams, UpsertLeadResponse, UpsertLeadRequest>,
      res: Response<UpsertLeadResponse>
    ) => {
      const id = await crmCommonObjectService.upsert('lead', req.customerConnection, {
        record: camelcaseKeysSansCustomFields(req.body.record),
        upsertOn: camelcaseKeys(req.body.upsert_on),
      });
      return res.status(200).send({ record: { id } });
    }
  );

  router.post(
    '/_search',
    async (
      req: Request<SearchLeadsPathParams, SearchLeadsResponse, SearchLeadsRequest, SearchLeadsQueryParams>,
      res: Response<SearchLeadsResponse>
    ) => {
      const { pagination, records } = await crmCommonObjectService.search('lead', req.customerConnection, {
        filter: req.body.filter,
        cursor: req.query?.cursor,
        pageSize: req.query?.page_size ? parseInt(req.query.page_size) : undefined,
      });
      return res.status(200).send({
        pagination,
        records: records.map((record) => {
          const snakecased = toSnakecasedKeysCrmLead(record);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { raw_data, ...rest } = snakecased;
          return req.query?.include_raw_data?.toString() === 'true' ? snakecased : rest;
        }),
      });
    }
  );

  router.delete('/:lead_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/leads', router);
}
