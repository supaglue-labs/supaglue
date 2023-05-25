import {
  CreateOpportunityPathParams,
  CreateOpportunityRequest,
  CreateOpportunityResponse,
  GetOpportunityPathParams,
  GetOpportunityRequest,
  GetOpportunityResponse,
  UpdateOpportunityPathParams,
  UpdateOpportunityRequest,
  UpdateOpportunityResponse,
} from '@supaglue/schemas/v2/crm';
import { Request, Response, Router } from 'express';

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:opportunity_id',
    async (
      req: Request<GetOpportunityPathParams, GetOpportunityResponse, GetOpportunityRequest>,
      res: Response<GetOpportunityResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateOpportunityPathParams, CreateOpportunityResponse, CreateOpportunityRequest>,
      res: Response<CreateOpportunityResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  router.patch(
    '/:opportunity_id',
    async (
      req: Request<UpdateOpportunityPathParams, UpdateOpportunityResponse, UpdateOpportunityRequest>,
      res: Response<UpdateOpportunityResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  router.delete('/:opportunity_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/opportunities', router);
}
