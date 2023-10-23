import { getDependencyContainer } from '@/dependency_container';
import { stringOrNullOrUndefinedToDate } from '@/lib/date';
import { BadRequestError } from '@supaglue/core/errors';
import { toSnakecasedKeysCrmOpportunity } from '@supaglue/core/mappers/crm';
import { toMappedProperties } from '@supaglue/core/remotes/utils/properties';
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
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
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
        req.params.opportunity_id
      );
      const snakecasedKeysOpportunity = toSnakecasedKeysCrmOpportunity(opportunity);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysOpportunity;
      return res
        .status(200)
        .send(req.query?.include_raw_data?.toString() === 'true' ? snakecasedKeysOpportunity : rest);
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
      if (req.query?.read_from_cache?.toString() !== 'true') {
        throw new BadRequestError('Uncached reads not yet implemented for leads.');
      }
      const includeRawData = req.query?.include_raw_data?.toString() === 'true';
      const { pagination, records } = await managedDataService.getCrmOpportunityRecords(
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
    throw new Error('Not implemented');
  });

  app.use('/opportunities', router);
}
