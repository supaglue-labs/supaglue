import { getDependencyContainer } from '@/dependency_container';
import { toGetInternalParams, toListInternalParams } from '@supaglue/core/mappers';
import { toSnakecasedKeysSequenceState } from '@supaglue/core/mappers/engagement';
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
} from '@supaglue/schemas/engagement';
import { ListParams } from '@supaglue/types';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
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
      const { next, previous, results } = await sequenceStateService.list(
        req.customerConnection.id,
        toListInternalParams(req.query)
      );
      const snakeCaseKeysResults = results.map(toSnakecasedKeysSequenceState);
      return res.status(200).send({ next, previous, results: snakeCaseKeysResults });
    }
  );

  router.get(
    '/:sequence_state_id',
    async (
      req: Request<GetSequenceStatePathParams, GetSequenceStateResponse, GetSequenceStateRequest>,
      res: Response<GetSequenceStateResponse>
    ) => {
      const sequenceState = await sequenceStateService.getById(
        req.params.sequence_state_id,
        req.customerConnection.id,
        toGetInternalParams(req.query)
      );
      return res.status(200).send(toSnakecasedKeysSequenceState(sequenceState));
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateSequenceStatePathParams, CreateSequenceStateResponse, CreateSequenceStateRequest>,
      res: Response<CreateSequenceStateResponse>
    ) => {
      const { customerId, id: connectionId } = req.customerConnection;
      const sequenceState = await sequenceStateService.create(
        customerId,
        connectionId,
        camelcaseKeysSansCustomFields(req.body.model)
      );
      return res.status(200).send({ model: toSnakecasedKeysSequenceState(sequenceState) });
    }
  );
  app.use('/sequence_states', router);
}
