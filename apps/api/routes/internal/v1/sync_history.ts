import { getDependencyContainer } from '@/dependency_container';
import { toPaginationInternalParams } from '@supaglue/core/lib';
import {
  GetSyncHistoryPathParams,
  GetSyncHistoryQueryParams,
  GetSyncHistoryRequest,
  GetSyncHistoryResponse,
} from '@supaglue/schemas/v1/mgmt';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
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
        applicationId: req.supaglueApplication.id,
        paginationParams: toPaginationInternalParams({ page_size: req.query?.page_size, cursor: req.query?.cursor }),
        model: req.query?.model,
        externalCustomerId: req.query?.customer_id,
        providerName: req.query?.provider_name,
      });

      const snakeCaseResults = results.map((result) =>
        snakecaseKeys({
          ...result,
          startTimestamp: result.startTimestamp.toISOString(),
          endTimestamp: result.endTimestamp?.toISOString() ?? null,
        })
      );
      return res.status(200).send({ next, previous, results: snakeCaseResults });
    }
  );
}
