import { getDependencyContainer } from '@/dependency_container';
import { stringOrNullOrUndefinedToDate } from '@/lib/date';
import { toSnakecasedKeysCrmOpportunity } from '@supaglue/core/mappers/crm';
import type {
  CreateOpportunityPathParams,
  CreateOpportunityRequest,
  CreateOpportunityResponse,
  GetOpportunityPathParams,
  GetOpportunityQueryParams,
  GetOpportunityRequest,
  GetOpportunityResponse,
  UpdateOpportunityPathParams,
  UpdateOpportunityRequest,
  UpdateOpportunityResponse,
} from '@supaglue/schemas/v2/crm';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { crmCommonObjectService } = getDependencyContainer();

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
      return res.status(200).send({ record: { id } });
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
