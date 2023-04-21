import { getDependencyContainer } from '@/dependency_container';
import { toSnakecasedKeysLead } from '@supaglue/core/mappers';
import {
  CreateLeadPathParams,
  CreateLeadRequest,
  CreateLeadResponse,
  UpdateLeadPathParams,
  UpdateLeadRequest,
  UpdateLeadResponse,
} from '@supaglue/schemas/crm';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import { Request, Response, Router } from 'express';

const { leadService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.post(
    '/',
    async (
      req: Request<CreateLeadPathParams, CreateLeadResponse, CreateLeadRequest>,
      res: Response<CreateLeadResponse>
    ) => {
      const { customerId, id: connectionId } = req.customerConnection;
      const lead = await leadService.create(customerId, connectionId, camelcaseKeysSansCustomFields(req.body.model));
      return res.status(200).send({ model: toSnakecasedKeysLead(lead) });
    }
  );

  router.patch(
    '/:lead_id',
    async (
      req: Request<UpdateLeadPathParams, UpdateLeadResponse, UpdateLeadRequest>,
      res: Response<UpdateLeadResponse>
    ) => {
      const { customerId, id: connectionId } = req.customerConnection;
      const lead = await leadService.update(customerId, connectionId, {
        id: req.params.lead_id,
        ...camelcaseKeysSansCustomFields(req.body.model),
      });
      return res.status(200).send({ model: toSnakecasedKeysLead(lead) });
    }
  );

  app.use('/leads', router);
}
