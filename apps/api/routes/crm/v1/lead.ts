import { getDependencyContainer } from '@/dependency_container';
import { toSearchInternalParams, toSnakecasedKeysLead } from '@supaglue/core/mappers';
import { toGetInternalParams, toListInternalParams } from '@supaglue/core/mappers/params';
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
  SearchLeadsPathParams,
  SearchLeadsRequest,
  SearchLeadsResponse,
  UpdateLeadPathParams,
  UpdateLeadRequest,
  UpdateLeadResponse,
} from '@supaglue/schemas/crm';
import { ListParams } from '@supaglue/types/common';
import { camelcaseKeys, camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
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
      const { next, previous, results } = await leadService.list(
        req.customerConnection.id,
        toListInternalParams(req.query)
      );
      const snakeCaseKeysResults = results.map(toSnakecasedKeysLead);
      return res.status(200).send({ next, previous, results: snakeCaseKeysResults });
    }
  );

  router.get(
    '/:lead_id',
    async (req: Request<GetLeadPathParams, GetLeadResponse, GetLeadRequest>, res: Response<GetLeadResponse>) => {
      const lead = await leadService.getById(
        req.params.lead_id,
        req.customerConnection.id,
        toGetInternalParams(req.query)
      );
      return res.status(200).send(toSnakecasedKeysLead(lead));
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

  router.post(
    '/_search',
    async (
      req: Request<SearchLeadsPathParams, SearchLeadsResponse, SearchLeadsRequest>,
      res: Response<SearchLeadsResponse>
    ) => {
      const { next, previous, results } = await leadService.search(
        req.customerConnection.id,
        toSearchInternalParams(req.query),
        camelcaseKeys(req.body.filters)
      );

      const snakeCaseKeysResults = results.map(toSnakecasedKeysLead);

      return res.status(200).send({ next, previous, results: snakeCaseKeysResults });
    }
  );

  router.delete('/:lead_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/leads', router);
}
