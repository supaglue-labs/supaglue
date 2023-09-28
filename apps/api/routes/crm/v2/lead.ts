import { getDependencyContainer } from '@/dependency_container';
import { toSnakecasedKeysCrmLead } from '@supaglue/core/mappers/crm';
import type {
  CreateLeadPathParams,
  CreateLeadRequest,
  CreateLeadResponse,
  GetLeadPathParams,
  GetLeadQueryParams,
  GetLeadRequest,
  GetLeadResponse,
  UpdateLeadPathParams,
  UpdateLeadRequest,
  UpdateLeadResponse,
  UpsertLeadPathParams,
  UpsertLeadRequest,
  UpsertLeadResponse,
} from '@supaglue/schemas/v2/crm';
import { camelcaseKeys, camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { crmCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:lead_id',
    async (
      req: Request<GetLeadPathParams, GetLeadResponse, GetLeadRequest, GetLeadQueryParams>,
      res: Response<GetLeadResponse>
    ) => {
      const lead = await crmCommonObjectService.get('lead', req.customerConnection, req.params.lead_id);
      const snakecasedKeysLead = toSnakecasedKeysCrmLead(lead);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysLead;
      return res.status(200).send(req.query?.include_raw_data?.toString() === 'true' ? snakecasedKeysLead : rest);
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateLeadPathParams, CreateLeadResponse, CreateLeadRequest>,
      res: Response<CreateLeadResponse>
    ) => {
      const id = await crmCommonObjectService.create(
        'lead',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body.record)
      );
      return res.status(200).send({ record: { id } });
    }
  );

  router.patch(
    '/:lead_id',
    async (
      req: Request<UpdateLeadPathParams, UpdateLeadResponse, UpdateLeadRequest>,
      res: Response<UpdateLeadResponse>
    ) => {
      await crmCommonObjectService.update('lead', req.customerConnection, {
        id: req.params.lead_id,
        ...camelcaseKeysSansCustomFields(req.body.record),
      });
      return res.status(200).send({});
    }
  );

  router.post(
    '/_upsert',
    async (
      req: Request<UpsertLeadPathParams, UpsertLeadResponse, UpsertLeadRequest>,
      res: Response<UpsertLeadResponse>
    ) => {
      const id = await crmCommonObjectService.upsert('lead', req.customerConnection, {
        record: camelcaseKeysSansCustomFields(req.body.record),
        upsertOn: camelcaseKeys(req.body.upsert_on),
      });
      return res.status(200).send({ record: { id } });
    }
  );

  router.delete('/:lead_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/leads', router);
}
