import {
  CreateSequenceStatePathParams,
  CreateSequenceStateRequest,
  CreateSequenceStateResponse,
} from '@supaglue/schemas/engagement';
import { Request, Response, Router } from 'express';

export default function init(app: Router): void {
  const router = Router();

  router.post(
    '/',
    async (
      req: Request<CreateSequenceStatePathParams, CreateSequenceStateResponse, CreateSequenceStateRequest>,
      res: Response<CreateSequenceStateResponse>
    ) => {
      throw new Error('not implemente');
    }
  );
  app.use('/sequence_states', router);
}
