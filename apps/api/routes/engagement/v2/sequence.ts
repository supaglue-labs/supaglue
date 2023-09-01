import { getDependencyContainer } from '@/dependency_container';
import { toSnakecasedKeysSequence } from '@supaglue/core/mappers/engagement';
import type {
  CreateSequencePathParams,
  CreateSequenceRequest,
  CreateSequenceResponse,
  GetSequencePathParams,
  GetSequenceRequest,
  GetSequenceResponse,
} from '@supaglue/schemas/v2/engagement';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { engagementCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:sequence_id',
    async (
      req: Request<GetSequencePathParams, GetSequenceResponse, GetSequenceRequest>,
      res: Response<GetSequenceResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const sequence = await engagementCommonObjectService.get('sequence', connectionId, req.params.sequence_id);
      const snakecasedKeysSequence = toSnakecasedKeysSequence(sequence);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysSequence;
      return res.status(200).send(req.query.include_raw_data === 'true' ? snakecasedKeysSequence : rest);
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateSequencePathParams, CreateSequenceResponse, CreateSequenceRequest>,
      res: Response<CreateSequenceResponse>
    ) => {
      const id = await engagementCommonObjectService.create(
        'sequence',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body.record)
      );
      return res.status(200).send({ record: { id } });
    }
  );

  router.patch('/:sequence_id', async (req: Request, res: Response) => {
    throw new Error('Not implemented');
  });

  app.use('/sequences', router);
}
