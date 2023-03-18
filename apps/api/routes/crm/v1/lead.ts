import { getDependencyContainer } from '@/dependency_container';
import { camelcaseKeysSansCustomFields } from '@/lib/camelcase';
import { snakecaseKeys } from '@supaglue/core/lib/snakecase';
import { GetParams, ListParams } from '@supaglue/core/types/common';
import {
  CreateLeadPathParams,
  CreateLeadRequest,
  CreateLeadResponse,
  GetLeadPathParams,
  GetLeadRequest,
  GetLeadResponse,
  GetLeadsPathParams,
  GetLeadsRequest,
  GetLeadsResponse,
  UpdateLeadPathParams,
  UpdateLeadRequest,
  UpdateLeadResponse,
} from '@supaglue/schemas/crm';
import { Request, Response, Router } from 'express';

const { leadService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<GetLeadsPathParams, GetLeadsResponse, GetLeadsRequest, /* GetLeadsQueryParams */ ListParams>,
      res: Response<GetLeadsResponse>
    ) => {
      const { next, previous, results } = await leadService.list(req.customerConnection.id, req.query);
      const snakeCaseKeysResults = results.map((result) => {
        return snakecaseKeys(result);
      });
      return res.status(200).send({ next, previous, results: snakeCaseKeysResults });
    }
  );

  router.get(
    '/:lead_id',
    async (
      req: Request<GetLeadPathParams, GetLeadResponse, GetLeadRequest, /* GetLeadQueryParams */ GetParams>,
      res: Response<GetLeadResponse>
    ) => {
      const lead = await leadService.getById(req.params.lead_id, req.customerConnection.id, req.query);
      return res.status(200).send(snakecaseKeys(lead));
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateLeadPathParams, CreateLeadResponse, CreateLeadRequest>,
      res: Response<CreateLeadResponse>
    ) => {
      const { customerId, id: connectionId } = req.customerConnection;
      const lead = await leadService.create(customerId, connectionId, camelcaseKeysSansCustomFields(req.body.model));
      return res.status(200).send({ model: snakecaseKeys(lead) });
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
      return res.status(200).send({ model: snakecaseKeys(lead) });
    }
  );

  router.delete('/:lead_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/leads', router);
}
