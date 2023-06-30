import { getDependencyContainer } from '@/dependency_container';
import { toSnakecasedKeysMailbox } from '@supaglue/core/mappers/engagement';
import { GetMailboxPathParams, GetMailboxRequest, GetMailboxResponse } from '@supaglue/schemas/v2/engagement';
import { Request, Response, Router } from 'express';

const { engagementCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:mailbox_id',
    async (
      req: Request<GetMailboxPathParams, GetMailboxResponse, GetMailboxRequest>,
      res: Response<GetMailboxResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const mailbox = await engagementCommonObjectService.get('mailbox', connectionId, req.params.mailbox_id);
      const snakecasedKeysMailbox = toSnakecasedKeysMailbox(mailbox);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysMailbox;
      return res.status(200).send(req.query.include_raw_data === 'true' ? snakecasedKeysMailbox : rest);
    }
  );

  router.post('/', async (req: Request, res: Response) => {
    throw new Error('Not implemented');
  });

  router.patch('/:mailbox_id', async (req: Request, res: Response) => {
    throw new Error('Not implemented');
  });

  app.use('/mailboxes', router);
}
