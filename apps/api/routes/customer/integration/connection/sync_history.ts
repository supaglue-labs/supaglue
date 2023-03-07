import { getDependencyContainer } from '@/dependency_container';
import { snakecaseKeys } from '@/lib/snakecase';
import {
  GetSyncHistoryPathParams,
  GetSyncHistoryQueryParams,
  GetSyncHistoryRequest,
  GetSyncHistoryResponse,
} from '@supaglue/schemas/customer';
import { Request, Response, Router } from 'express';

const { syncHistoryService } = getDependencyContainer();

export default function init(app: Router) {
  app.get(
    '/sync-history',
    async (
      req: Request<GetSyncHistoryPathParams, GetSyncHistoryResponse, GetSyncHistoryRequest, GetSyncHistoryQueryParams>,
      res: Response<GetSyncHistoryResponse>
    ) => {
      const { next, previous, results } = await syncHistoryService.list({
        connectionId: req.params.connection_id,
        paginationParams: req.query,
        model: req.query.model,
      });

      const snakeCaseResults = results.map((result) =>
        snakecaseKeys({
          ...result,
          startTimestamp: result.startTimestamp.toISOString(),
          endTimestamp: result.endTimestamp?.toISOString(),
        })
      );
      return res.status(200).send({ next, previous, results: snakeCaseResults });
    }
  );
}
