import { getDependencyContainer } from '@/dependency_container';
import { toGetInternalParams, toListInternalParams } from '@supaglue/core/mappers';
import { toSnakecasedKeysMailbox } from '@supaglue/core/mappers/engagement';
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
      const { next, previous, results } = await mailboxService.list(
        req.customerConnection.id,
        toListInternalParams(req.query)
      );
      const snakeCaseKeysResults = results.map(toSnakecasedKeysMailbox);
      return res.status(200).send({ next, previous, results: snakeCaseKeysResults });
    }
  );

  router.get(
    '/:mailbox_id',
    async (
      req: Request<GetMailboxPathParams, GetMailboxResponse, GetMailboxRequest>,
      res: Response<GetMailboxResponse>
    ) => {
      const mailbox = await mailboxService.getById(
        req.params.mailbox_id,
        req.customerConnection.id,
        toGetInternalParams(req.query)
      );
      return res.status(200).send(toSnakecasedKeysMailbox(mailbox));
    }
  );

  app.use('/mailboxes', router);
}
