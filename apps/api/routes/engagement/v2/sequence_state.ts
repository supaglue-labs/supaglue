import { getDependencyContainer } from '@/dependency_container';
import { toSnakecasedKeysSequenceState } from '@supaglue/core/mappers/engagement';
import {
  CreateSequenceStatePathParams,
  CreateSequenceStateRequest,
  CreateSequenceStateResponse,
  GetSequenceStatePathParams,
  GetSequenceStateRequest,
  GetSequenceStateResponse,
} from '@supaglue/schemas/v2/engagement';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import { Request, Response, Router } from 'express';

const { engagementCommonModelService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:sequence_state_id',
    async (
      req: Request<GetSequenceStatePathParams, GetSequenceStateResponse, GetSequenceStateRequest>,
      res: Response<GetSequenceStateResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const mailbox = await engagementCommonModelService.get(
        'sequence_state',
        connectionId,
        req.params.sequence_state_id
      );
      const snakecasedKeysMailbox = toSnakecasedKeysSequenceState(mailbox);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysMailbox;
      return res.status(200).send(req.query.include_raw_data === 'true' ? snakecasedKeysMailbox : rest);
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateSequenceStatePathParams, CreateSequenceStateResponse, CreateSequenceStateRequest>,
      res: Response<CreateSequenceStateResponse>
    ) => {
      const id = await engagementCommonModelService.create(
        'sequence_state',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body.record)
      );
      return res.status(200).send({ record: { id } });
    }
  );

  router.patch('/:sequence_state_id', async (req: Request, res: Response) => {
    throw new Error('Not implemented');
  });

  app.use('/sequence_states', router);
}
