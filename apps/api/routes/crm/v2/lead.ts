import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError, NotImplementedError } from '@supaglue/core/errors';
import { toSnakecasedKeysCrmLead } from '@supaglue/core/mappers/crm';
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
import { camelcaseKeys, camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { crmCommonObjectService, managedDataService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:lead_id',
    async (
      req: Request<GetLeadPathParams, GetLeadResponse, GetLeadRequest, GetLeadQueryParams>,
      res: Response<GetLeadResponse>
    ) => {
      const lead = await crmCommonObjectService.get('lead', req.customerConnection, req.params.lead_id, {
        includeRawData: req.query?.include_raw_data?.toString() === 'true',
        expand: req.query?.expand?.split(','),
      });
      return res.status(200).send(toSnakecasedKeysCrmLead(lead));
    }
  );

  router.get(
    '/',
    async (
      req: Request<ListLeadsPathParams, ListLeadsResponse, ListLeadsRequest, ListLeadsQueryParams>,
      res: Response<ListLeadsResponse>
    ) => {
      const includeRawData = req.query?.include_raw_data?.toString() === 'true';

      if (req.query?.read_from_cache?.toString() !== 'true') {
        const { pagination, records } = await crmCommonObjectService.list('lead', req.customerConnection, {
          modifiedAfter: req.query?.modified_after,
          includeRawData,
          expand: req.query?.expand?.split(','),
          cursor: req.query?.cursor,
          pageSize: req.query?.page_size ? parseInt(req.query.page_size) : undefined,
        });
        return res.status(200).send({
          pagination,
          records: records.map(toSnakecasedKeysCrmLead),
        });
      }
      // TODO: Implement expand for uncached reads
      if (req.query?.expand?.length) {
        throw new BadRequestError('Expand is not yet supported for uncached reads');
      }

      return res
        .status(200)
        .send(
          await managedDataService.getCrmLeadRecords(
            req.supaglueApplication.id,
            req.customerConnection.providerName,
            req.customerId,
            req.customerConnection.id,
            req.query?.cursor,
            req.query?.modified_after as unknown as string | undefined,
            req.query?.page_size ? parseInt(req.query.page_size) : undefined
          )
        );
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
        includeRawData: req.query?.include_raw_data?.toString() === 'true',
      });
      return res.status(200).send({
        pagination,
        records: records.map(toSnakecasedKeysCrmLead),
      });
    }
  );

  router.delete('/:lead_id', () => {
    throw new NotImplementedError('Not implemented');
  });

  app.use('/leads', router);
}
