import {
  GetMailboxesPathParams,
  GetMailboxesRequest,
  GetMailboxesResponse,
  GetMailboxPathParams,
  GetMailboxRequest,
  GetMailboxResponse,
} from '@supaglue/schemas/engagement';
import { ListParams } from '@supaglue/types/common';
import { Request, Response, Router } from 'express';

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<
        GetMailboxesPathParams,
        GetMailboxesResponse,
        GetMailboxesRequest,
        /* GetMailboxesQueryParams */ ListParams
      >,
      res: Response<GetMailboxesResponse>
    ) => {
      throw new Error('not implemented');
    }
  );

  router.get(
    '/:mailbox_id',
    async (
      req: Request<GetMailboxPathParams, GetMailboxResponse, GetMailboxRequest>,
      res: Response<GetMailboxResponse>
    ) => {
      throw new Error('not implemented');
    }
  );

  app.use('/mailboxes', router);
}
