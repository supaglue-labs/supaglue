import { getDependencyContainer } from '@/dependency_container';
import { toSnakecasedKeysCrmContactV2 } from '@supaglue/core/mappers/crm';
import {
  CreateContactPathParams,
  CreateContactRequest,
  CreateContactResponse,
  GetContactPathParams,
  GetContactQueryParams,
  GetContactRequest,
  GetContactResponse,
  UpdateContactPathParams,
  UpdateContactQueryParams,
  UpdateContactRequest,
  UpdateContactResponse,
} from '@supaglue/schemas/v2/crm';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import { Request, Response, Router } from 'express';

const { crmCommonModelService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:contact_id',
    async (
      req: Request<GetContactPathParams, GetContactResponse, GetContactRequest, GetContactQueryParams>,
      res: Response<GetContactResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const contact = await crmCommonModelService.get('contact', connectionId, req.params.contact_id);
      const snakecasedKeysContact = toSnakecasedKeysCrmContactV2(contact);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysContact;
      return res.status(200).send(req.query.include_raw_data === 'true' ? snakecasedKeysContact : rest);
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateContactPathParams, CreateContactResponse, CreateContactRequest>,
      res: Response<CreateContactResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const id = await crmCommonModelService.create(
        'contact',
        connectionId,
        camelcaseKeysSansCustomFields(req.body.model)
      );
      return res.status(200).send({ model: { id } });
    }
  );

  router.patch<string, UpdateContactPathParams, UpdateContactResponse, UpdateContactRequest, UpdateContactQueryParams>(
    '/:contact_id',
    async (
      req: Request<UpdateContactPathParams, UpdateContactResponse, UpdateContactRequest>,
      res: Response<UpdateContactResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      await crmCommonModelService.update('contact', connectionId, {
        id: req.params.contact_id,
        ...camelcaseKeysSansCustomFields(req.body.model),
      });
      return res.status(200).send({});
    }
  );

  router.delete('/:contact_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/contacts', router);
}
