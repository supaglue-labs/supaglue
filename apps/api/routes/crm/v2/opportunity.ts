import { getDependencyContainer } from '@/dependency_container';
import { stringOrNullOrUndefinedToDate } from '@/lib/date';
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
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import { Request, Response, Router } from 'express';

const { crmCommonModelService } = getDependencyContainer();

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
      const { id: connectionId } = req.customerConnection;
      const id = await crmCommonModelService.create('opportunity', connectionId, {
        ...camelcaseKeysSansCustomFields(req.body.model),
        closeDate: stringOrNullOrUndefinedToDate(req.body.model.close_date),
      });
      return res.status(200).send({ model: { id } });
    }
  );

  router.patch(
    '/:opportunity_id',
    async (
      req: Request<UpdateOpportunityPathParams, UpdateOpportunityResponse, UpdateOpportunityRequest>,
      res: Response<UpdateOpportunityResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      await crmCommonModelService.update('opportunity', connectionId, {
        id: req.params.opportunity_id,
        ...camelcaseKeysSansCustomFields(req.body.model),
        closeDate: stringOrNullOrUndefinedToDate(req.body.model.close_date),
      });
      return res.status(200).send({});
    }
  );

  router.delete('/:opportunity_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/opportunities', router);
}
