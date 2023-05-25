import { getDependencyContainer } from '@/dependency_container';
import {
  GetMailboxesPathParams,
  GetMailboxesRequest,
  GetMailboxesResponse,
  GetMailboxPathParams,
  GetMailboxRequest,
  GetMailboxResponse,
} from '@supaglue/schemas/v1/engagement';
import { ListParams } from '@supaglue/types/common';
import { Request, Response, Router } from 'express';

const {
  engagement: { mailboxService },
} = getDependencyContainer();

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
      throw new Error('Not implemented');
    }
  );

  router.get(
    '/:mailbox_id',
    async (
      req: Request<GetMailboxPathParams, GetMailboxResponse, GetMailboxRequest>,
      res: Response<GetMailboxResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  app.use('/mailboxes', router);
}
