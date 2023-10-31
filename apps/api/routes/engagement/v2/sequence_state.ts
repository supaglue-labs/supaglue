import { getDependencyContainer } from '@/dependency_container';
import { toSnakecasedKeysSequenceState } from '@supaglue/core/mappers/engagement';
import type {
  BatchCreateSequenceStatePathParams,
  BatchCreateSequenceStateRequest,
  BatchCreateSequenceStateResponse,
  CreateSequenceStatePathParams,
  CreateSequenceStateRequest,
  CreateSequenceStateResponse,
  GetSequenceStatePathParams,
  GetSequenceStateRequest,
  GetSequenceStateResponse,
} from '@supaglue/schemas/v2/engagement';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { engagementCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:sequence_state_id',
    async (
      req: Request<GetSequenceStatePathParams, GetSequenceStateResponse, GetSequenceStateRequest>,
      res: Response<GetSequenceStateResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const mailbox = await engagementCommonObjectService.get(
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
      const id = await engagementCommonObjectService.create(
        'sequence_state',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body.record)
      );

      return res.status(201).send({ record: { id } });
    }
  );

  router.post(
    '/_batch',
    async (
      req: Request<
        BatchCreateSequenceStatePathParams,
        BatchCreateSequenceStateResponse,
        BatchCreateSequenceStateRequest
      >,
      res: Response<BatchCreateSequenceStateResponse>
    ) => {
      const ids = await engagementCommonObjectService.batchCreate(
        'sequence_state',
        req.customerConnection,
        req.body.records.map(camelcaseKeysSansCustomFields)
      );

      return res.status(201).send({ records: ids.map((id) => ({ id })) });
    }
  );

  router.patch('/:sequence_state_id', async (req: Request, res: Response) => {
    throw new Error('Not implemented');
  });

  app.use('/sequence_states', router);
}
