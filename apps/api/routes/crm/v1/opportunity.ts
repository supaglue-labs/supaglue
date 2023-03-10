import { getDependencyContainer } from '@/dependency_container';
import { camelcaseKeys } from '@/lib/camelcase';
import { stringOrNullOrUndefinedToDate } from '@/lib/date';
import { snakecaseKeys } from '@/lib/snakecase';
import { GetParams, ListParams } from '@supaglue/core/types/common';
import {
  CreateOpportunityPathParams,
  CreateOpportunityRequest,
  CreateOpportunityResponse,
  GetOpportunitiesPathParams,
  GetOpportunitiesRequest,
  GetOpportunitiesResponse,
  GetOpportunityPathParams,
  GetOpportunityRequest,
  GetOpportunityResponse,
  UpdateOpportunityPathParams,
  UpdateOpportunityRequest,
  UpdateOpportunityResponse,
} from '@supaglue/schemas/crm';
import { Request, Response, Router } from 'express';

const { opportunityService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<
        GetOpportunitiesPathParams,
        GetOpportunitiesResponse,
        GetOpportunitiesRequest,
        /* GetOpportunitiesQueryParams */ ListParams
      >,
      res: Response<GetOpportunitiesResponse>
    ) => {
      const { next, previous, results } = await opportunityService.list(req.customerConnection.id, req.query);
      const snakeCaseKeysResults = results.map((result) => {
        return snakecaseKeys(result);
      });
      return res.status(200).send({ next, previous, results: snakeCaseKeysResults });
    }
  );

  router.get(
    '/:opportunity_id',
    async (
      req: Request<
        GetOpportunityPathParams,
        GetOpportunityResponse,
        GetOpportunityRequest,
        /* GetOpportunityQueryParams */ GetParams
      >,
      res: Response<GetOpportunityResponse>
    ) => {
      const opportunity = await opportunityService.getById(
        req.params.opportunity_id,
        req.customerConnection.id,
        req.query
      );
      return res.status(200).send(snakecaseKeys(opportunity));
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateOpportunityPathParams, CreateOpportunityResponse, CreateOpportunityRequest>,
      res: Response<CreateOpportunityResponse>
    ) => {
      const { customerId, id: connectionId } = req.customerConnection;
      const originalParams = camelcaseKeys(req.body.model);
      const opportunityCreateParams = {
        ...originalParams,
        closeDate: stringOrNullOrUndefinedToDate(originalParams.closeDate),
      };
      const opportunity = await opportunityService.create(customerId, connectionId, opportunityCreateParams);
      return res.status(200).send({ model: snakecaseKeys(opportunity) });
    }
  );

  router.patch(
    '/:opportunity_id',
    async (
      req: Request<UpdateOpportunityPathParams, UpdateOpportunityResponse, UpdateOpportunityRequest>,
      res: Response<UpdateOpportunityResponse>
    ) => {
      const { customerId, id: connectionId } = req.customerConnection;
      const originalParams = camelcaseKeys(req.body.model);
      const opportunityUpdateParams = {
        id: req.params.opportunity_id,
        ...originalParams,
        closeDate: stringOrNullOrUndefinedToDate(originalParams.closeDate),
      };
      const account = await opportunityService.update(customerId, connectionId, opportunityUpdateParams);
      return res.status(200).send({ model: snakecaseKeys(account) });
    }
  );

  router.delete('/:opportunity_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/opportunities', router);
}
