import { getDependencyContainer } from '@/dependency_container';
import { stringOrNullOrUndefinedToDate } from '@/lib/date';
import { toSnakecasedKeysOpportunity } from '@supaglue/core/mappers';
import {
  CreateOpportunityPathParams,
  CreateOpportunityRequest,
  CreateOpportunityResponse,
  UpdateOpportunityPathParams,
  UpdateOpportunityRequest,
  UpdateOpportunityResponse,
} from '@supaglue/schemas/crm';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import { Request, Response, Router } from 'express';

const { opportunityService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();
  router.post(
    '/',
    async (
      req: Request<CreateOpportunityPathParams, CreateOpportunityResponse, CreateOpportunityRequest>,
      res: Response<CreateOpportunityResponse>
    ) => {
      const { customerId, id: connectionId } = req.customerConnection;
      const originalParams = camelcaseKeysSansCustomFields(req.body.model);
      const opportunityCreateParams = {
        ...originalParams,
        closeDate: stringOrNullOrUndefinedToDate(originalParams.closeDate),
      };
      const opportunity = await opportunityService.create(customerId, connectionId, opportunityCreateParams);
      return res.status(200).send({ model: toSnakecasedKeysOpportunity(opportunity) });
    }
  );

  router.patch(
    '/:opportunity_id',
    async (
      req: Request<UpdateOpportunityPathParams, UpdateOpportunityResponse, UpdateOpportunityRequest>,
      res: Response<UpdateOpportunityResponse>
    ) => {
      const { customerId, id: connectionId } = req.customerConnection;
      const originalParams = camelcaseKeysSansCustomFields(req.body.model);
      const opportunityUpdateParams = {
        remoteId: req.params.opportunity_id,
        ...originalParams,
        closeDate: stringOrNullOrUndefinedToDate(originalParams.closeDate),
      };
      const opportunity = await opportunityService.update(customerId, connectionId, opportunityUpdateParams);
      return res.status(200).send({ model: toSnakecasedKeysOpportunity(opportunity) });
    }
  );

  app.use('/opportunities', router);
}
