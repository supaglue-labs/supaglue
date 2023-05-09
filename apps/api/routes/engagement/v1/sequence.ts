import {
  GetSequencePathParams,
  GetSequenceRequest,
  GetSequenceResponse,
  GetSequencesPathParams,
  GetSequencesRequest,
  GetSequencesResponse,
} from '@supaglue/schemas/engagement';
import { ListParams } from '@supaglue/types/common';
import { Request, Response, Router } from 'express';

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<
        GetSequencesPathParams,
        GetSequencesResponse,
        GetSequencesRequest,
        /* GetSequencesQueryParams */ ListParams
      >,
      res: Response<GetSequencesResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  router.get(
    '/:sequence_id',
    async (
      req: Request<GetSequencePathParams, GetSequenceResponse, GetSequenceRequest>,
      res: Response<GetSequenceResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  app.use('/sequences', router);
}
