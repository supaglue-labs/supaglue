import { getDependencyContainer } from '@/dependency_container';
import { stringOrNullOrUndefinedToDate } from '@/lib/date';
import { NotImplementedError } from '@supaglue/core/errors';
import { toSnakecasedKeysCrmOpportunity } from '@supaglue/core/mappers/crm';
import type {
  CreateOpportunityPathParams,
  CreateOpportunityRequest,
  CreateOpportunityResponse,
  GetOpportunityPathParams,
  GetOpportunityQueryParams,
  GetOpportunityRequest,
  GetOpportunityResponse,
  ListOpportunitiesPathParams,
  ListOpportunitiesQueryParams,
  ListOpportunitiesRequest,
  ListOpportunitiesResponse,
  UpdateOpportunityPathParams,
  UpdateOpportunityRequest,
  UpdateOpportunityResponse,
} from '@supaglue/schemas/v2/crm';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { crmCommonObjectService, connectionService, managedDataService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:opportunity_id',
    async (
      req: Request<GetOpportunityPathParams, GetOpportunityResponse, GetOpportunityRequest, GetOpportunityQueryParams>,
      res: Response<GetOpportunityResponse>
    ) => {
      const opportunity = await crmCommonObjectService.get(
        'opportunity',
        req.customerConnection,
        req.params.opportunity_id,
        {
          includeRawData: req.query?.include_raw_data?.toString() === 'true',
          associationsToFetch: req.query?.associations_to_fetch,
        }
      );
      return res.status(200).send(toSnakecasedKeysCrmOpportunity(opportunity));
    }
  );

  router.get(
    '/',
    async (
      req: Request<
        ListOpportunitiesPathParams,
        ListOpportunitiesResponse,
        ListOpportunitiesRequest,
        ListOpportunitiesQueryParams
      >,
      res: Response<ListOpportunitiesResponse>
    ) => {
      const includeRawData = req.query?.include_raw_data?.toString() === 'true';

      if (req.query?.read_from_cache?.toString() !== 'true') {
        const { pagination, records } = await crmCommonObjectService.list('opportunity', req.customerConnection, {
          modifiedAfter: req.query?.modified_after,
          cursor: req.query?.cursor,
          pageSize: req.query?.page_size ? parseInt(req.query.page_size) : undefined,
          includeRawData,
          associationsToFetch: req.query?.associations_to_fetch,
        });
        return res.status(200).send({
          pagination,
          records: records.map(toSnakecasedKeysCrmOpportunity),
        });
      }
      return res
        .status(200)
        .send(
          await managedDataService.getCrmOpportunityRecords(
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

  router.post(
    '/',
    async (
      req: Request<CreateOpportunityPathParams, CreateOpportunityResponse, CreateOpportunityRequest>,
      res: Response<CreateOpportunityResponse>
    ) => {
      const id = await crmCommonObjectService.create('opportunity', req.customerConnection, {
        ...camelcaseKeysSansCustomFields(req.body.record),
        closeDate: stringOrNullOrUndefinedToDate(req.body.record.close_date),
      });
      return res.status(201).send({ record: { id } });
    }
  );

  router.patch(
    '/:opportunity_id',
    async (
      req: Request<UpdateOpportunityPathParams, UpdateOpportunityResponse, UpdateOpportunityRequest>,
      res: Response<UpdateOpportunityResponse>
    ) => {
      await crmCommonObjectService.update('opportunity', req.customerConnection, {
        id: req.params.opportunity_id,
        ...camelcaseKeysSansCustomFields(req.body.record),
        closeDate: stringOrNullOrUndefinedToDate(req.body.record.close_date),
      });
      return res.status(200).send({});
    }
  );

  router.delete('/:opportunity_id', () => {
    throw new NotImplementedError('Not implemented');
  });

  app.use('/opportunities', router);
}
