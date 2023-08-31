import { getDependencyContainer } from '@/dependency_container';
import type {
  EnrichPersonPathParams,
  EnrichPersonQueryParams,
  EnrichPersonRequest,
  EnrichPersonResponse,
} from '@supaglue/schemas/v2/enrichment';
import { snakecaseKeys } from '@supaglue/utils';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { enrichmentCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<EnrichPersonPathParams, EnrichPersonResponse, EnrichPersonRequest, EnrichPersonQueryParams>,
      res: Response<EnrichPersonResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const data = await enrichmentCommonObjectService.enrichPerson(connectionId, req.query.email);
      return res.status(200).send(snakecaseKeys(data));
    }
  );

  app.use('/persons', router);
}
