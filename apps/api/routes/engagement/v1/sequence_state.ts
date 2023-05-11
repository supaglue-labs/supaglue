import { getDependencyContainer } from '@/dependency_container';
import { toSnakecasedKeysSequenceState } from '@supaglue/core/mappers/engagement';
import {
  CreateSequenceStatePathParams,
  CreateSequenceStateRequest,
  CreateSequenceStateResponse,
} from '@supaglue/schemas/engagement';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import { Request, Response, Router } from 'express';

const {
  engagement: { sequenceStateService },
} = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

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
