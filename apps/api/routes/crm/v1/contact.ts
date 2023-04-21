import { getDependencyContainer } from '@/dependency_container';
import { toSnakecasedKeysContact } from '@supaglue/core/mappers';
import {
  CreateContactPathParams,
  CreateContactQueryParams,
  CreateContactRequest,
  CreateContactResponse,
  UpdateContactPathParams,
  UpdateContactQueryParams,
  UpdateContactRequest,
  UpdateContactResponse,
} from '@supaglue/schemas/crm';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import { Request, Response, Router } from 'express';

const { commonModelService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.post<string, CreateContactPathParams, CreateContactResponse, CreateContactRequest, CreateContactQueryParams>(
    '/',
    async (
      req: Request<CreateContactPathParams, CreateContactResponse, CreateContactRequest>,
      res: Response<CreateContactResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const contact = await commonModelService.create(
        'contact',
        connectionId,
        camelcaseKeysSansCustomFields(req.body.model)
      );
      return res.status(200).send({ model: toSnakecasedKeysContact(contact) });
    }
  );

  router.patch<string, UpdateContactPathParams, UpdateContactResponse, UpdateContactRequest, UpdateContactQueryParams>(
    '/:contact_id',
    async (
      req: Request<UpdateContactPathParams, UpdateContactResponse, UpdateContactRequest>,
      res: Response<UpdateContactResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const contact = await commonModelService.update('contact', connectionId, {
        id: req.params.contact_id,
        ...camelcaseKeysSansCustomFields(req.body.model),
      });
      return res.status(200).send({ model: toSnakecasedKeysContact(contact) });
    }
  );

  app.use('/contacts', router);
}
