import { getDependencyContainer } from '@/dependency_container';
import {
  CreateSequenceStatePathParams,
  CreateSequenceStateRequest,
  CreateSequenceStateResponse,
  GetSequenceStatePathParams,
  GetSequenceStateRequest,
  GetSequenceStateResponse,
  GetSequenceStatesPathParams,
  GetSequenceStatesRequest,
  GetSequenceStatesResponse,
} from '@supaglue/schemas/v2/engagement';
import { ListParams } from '@supaglue/types';
import { Request, Response, Router } from 'express';

const {
  engagement: { sequenceStateService },
} = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<
        GetSequenceStatesPathParams,
        GetSequenceStatesResponse,
        GetSequenceStatesRequest,
        /* GetSequenceStatesQueryParams */ ListParams
      >,
      res: Response<GetSequenceStatesResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  router.get(
    '/:sequence_state_id',
    async (
      req: Request<GetSequenceStatePathParams, GetSequenceStateResponse, GetSequenceStateRequest>,
      res: Response<GetSequenceStateResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateSequenceStatePathParams, CreateSequenceStateResponse, CreateSequenceStateRequest>,
      res: Response<CreateSequenceStateResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );
  app.use('/sequence_states', router);
}
