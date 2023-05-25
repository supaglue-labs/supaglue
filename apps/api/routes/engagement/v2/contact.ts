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
} from '@supaglue/schemas/v2/engagement';
import { ListParams } from '@supaglue/types';
import { Request, Response, Router } from 'express';

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
      throw new Error('Not implemented');
    }
  );

  router.get(
    '/:contact_id',
    async (
      req: Request<GetContactPathParams, GetContactResponse, GetContactRequest, GetContactQueryParams>,
      res: Response<GetContactResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateContactPathParams, CreateContactResponse, CreateContactRequest>,
      res: Response<CreateContactResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  router.patch<string, UpdateContactPathParams, UpdateContactResponse, UpdateContactRequest, UpdateContactQueryParams>(
    '/:contact_id',
    async (
      req: Request<UpdateContactPathParams, UpdateContactResponse, UpdateContactRequest>,
      res: Response<UpdateContactResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  router.delete('/:contact_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/contacts', router);
}
