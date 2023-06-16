import { getDependencyContainer } from '@/dependency_container';
import { toSnakecasedKeysCrmLeadV2 } from '@supaglue/core/mappers/crm';
import {
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
} from '@supaglue/schemas/v2/crm';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import { Request, Response, Router } from 'express';

const { crmCommonModelService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:lead_id',
    async (
      req: Request<GetLeadPathParams, GetLeadResponse, GetLeadRequest, GetLeadQueryParams>,
      res: Response<GetLeadResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const lead = await crmCommonModelService.get('lead', connectionId, req.params.lead_id);
      const snakecasedKeysLead = toSnakecasedKeysCrmLeadV2(lead);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysLead;
      return res.status(200).send(req.query.include_raw_data === 'true' ? snakecasedKeysLead : rest);
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateLeadPathParams, CreateLeadResponse, CreateLeadRequest>,
      res: Response<CreateLeadResponse>
    ) => {
      const id = await crmCommonModelService.create(
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
      await crmCommonModelService.update('lead', req.customerConnection, {
        id: req.params.lead_id,
        ...camelcaseKeysSansCustomFields(req.body.record),
      });
      return res.status(200).send({});
    }
  );

  router.delete('/:lead_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/leads', router);
}
