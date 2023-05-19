import {
  GetSequenceStepPathParams,
  GetSequenceStepRequest,
  GetSequenceStepResponse,
  GetSequenceStepsPathParams,
  GetSequenceStepsRequest,
  GetSequenceStepsResponse,
} from '@supaglue/schemas/engagement';
import { ListParams } from '@supaglue/types';
import { Request, Response, Router } from 'express';

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<
        GetSequenceStepsPathParams,
        GetSequenceStepsResponse,
        GetSequenceStepsRequest,
        /* GetSequenceStepsQueryParams */ ListParams
      >,
      res: Response<GetSequenceStepsResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  router.get(
    '/:sequence_step_id',
    async (
      req: Request<GetSequenceStepPathParams, GetSequenceStepResponse, GetSequenceStepRequest>,
      res: Response<GetSequenceStepResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  app.use('/sequence_steps', router);
}
