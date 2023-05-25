import { getDependencyContainer } from '@/dependency_container';
import { toGetInternalParams, toListInternalParams } from '@supaglue/core/mappers';
import { toSnakecasedKeysSequence } from '@supaglue/core/mappers/engagement';
import {
  GetSequencePathParams,
  GetSequenceRequest,
  GetSequenceResponse,
  GetSequencesPathParams,
  GetSequencesRequest,
  GetSequencesResponse,
} from '@supaglue/schemas/v1/engagement';
import { ListParams } from '@supaglue/types/common';
import { Request, Response, Router } from 'express';

const {
  engagement: { sequenceService },
} = getDependencyContainer();

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
      const { next, previous, results } = await sequenceService.list(
        req.customerConnection.id,
        toListInternalParams(req.query)
      );
      const snakeCaseKeysResults = results.map(toSnakecasedKeysSequence);
      return res.status(200).send({ next, previous, results: snakeCaseKeysResults });
    }
  );

  router.get(
    '/:sequence_id',
    async (
      req: Request<GetSequencePathParams, GetSequenceResponse, GetSequenceRequest>,
      res: Response<GetSequenceResponse>
    ) => {
      const sequence = await sequenceService.getById(
        req.params.sequence_id,
        req.customerConnection.id,
        toGetInternalParams(req.query)
      );
      return res.status(200).send(toSnakecasedKeysSequence(sequence));
    }
  );

  app.use('/sequences', router);
}
