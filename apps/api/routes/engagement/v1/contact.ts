import { getDependencyContainer } from '@/dependency_container';
import { toGetInternalParams, toListInternalParams } from '@supaglue/core/mappers';
import { toSnakecasedKeysContact } from '@supaglue/core/mappers/engagement';
import {
  CreateContactPathParams,
  CreateContactRequest,
  CreateContactResponse,
  GetContactPathParams,
  GetContactQueryParams,
  GetContactRequest,
  GetContactResponse,
  GetContactsPathParams,
  GetContactsRequest,
  GetContactsResponse,
  UpdateContactPathParams,
  UpdateContactQueryParams,
  UpdateContactRequest,
  UpdateContactResponse,
} from '@supaglue/schemas/engagement';
import { ListParams } from '@supaglue/types';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import { Request, Response, Router } from 'express';

const {
  engagement: { contactService },
} = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<
        GetContactsPathParams,
        GetContactsResponse,
        GetContactsRequest,
        /* GetContactsQueryParams */ ListParams
      >,
      res: Response<GetContactsResponse>
    ) => {
      const { next, previous, results } = await contactService.list(
        req.customerConnection.id,
        toListInternalParams(req.query)
      );
      const snakeCaseKeysResults = results.map(toSnakecasedKeysContact);
      return res.status(200).send({ next, previous, results: snakeCaseKeysResults });
    }
  );

  router.get(
    '/:contact_id',
    async (
      req: Request<GetContactPathParams, GetContactResponse, GetContactRequest, GetContactQueryParams>,
      res: Response<GetContactResponse>
    ) => {
      const contact = await contactService.getById(
        req.params.contact_id,
        req.customerConnection.id,
        toGetInternalParams(req.query)
      );
      return res.status(200).send(toSnakecasedKeysContact(contact));
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateContactPathParams, CreateContactResponse, CreateContactRequest>,
      res: Response<CreateContactResponse>
    ) => {
      const { customerId, id: connectionId } = req.customerConnection;
      const contact = await contactService.create(
        customerId,
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
      const { customerId, id: connectionId } = req.customerConnection;
      const contact = await contactService.update(customerId, connectionId, {
        id: req.params.contact_id,
        ...camelcaseKeysSansCustomFields(req.body.model),
      });
      return res.status(200).send({ model: toSnakecasedKeysContact(contact) });
    }
  );

  router.post('/_search', async (req: Request, res: Response) => {
    throw new Error('Not implemented');
  });

  router.delete('/:contact_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/contacts', router);
}
