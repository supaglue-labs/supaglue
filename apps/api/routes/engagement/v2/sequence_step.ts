import { getDependencyContainer } from '@/dependency_container';
import type {
  CreateSequenceStepPathParams,
  CreateSequenceStepRequest,
  CreateSequenceStepResponse,
} from '@supaglue/schemas/v2/engagement';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { engagementCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get('/:sequence_step_id', async (req: Request, res: Response) => {
    throw new Error('Not implemented');
  });

  router.post(
    '/',
    async (
      req: Request<CreateSequenceStepPathParams, CreateSequenceStepResponse, CreateSequenceStepRequest>,
      res: Response<CreateSequenceStepResponse>
    ) => {
      const id = await engagementCommonObjectService.create(
        'sequence_step',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body.record)
      );
      return res.status(200).send({ record: { id } });
    }
  );

  router.patch('/:sequence_step_id', async (req: Request, res: Response) => {
    throw new Error('Not implemented');
  });

  app.use('/sequence_steps', router);
}
