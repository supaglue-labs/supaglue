import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError } from '@supaglue/core/errors';
import { toPaginationInternalParams } from '@supaglue/core/lib';
import type {
  GetSyncRunsPathParams,
  GetSyncRunsQueryParams,
  GetSyncRunsRequest,
  GetSyncRunsResponse,
} from '@supaglue/schemas/v2/mgmt';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response, Router } from 'express';

const { objectSyncRunService } = getDependencyContainer();

export default function init(app: Router) {
  app.get(
    '/sync-runs',
    async (
      req: Request<GetSyncRunsPathParams, GetSyncRunsResponse, GetSyncRunsRequest, GetSyncRunsQueryParams>,
      res: Response<GetSyncRunsResponse>
    ) => {
      function getObjectFilter() {
        if (req.query?.object_type && req.query.object) {
          return {
            objectType: req.query.object_type,
            object: req.query.object,
          };
        } else if (!req.query?.object_type && !req.query?.object) {
          return {};
        }
        throw new BadRequestError('object_type and object must both be present or both be absent');
      }

      const { next, previous, results, totalCount } = await objectSyncRunService.list({
        applicationId: req.supaglueApplication.id,
        paginationParams: toPaginationInternalParams({ page_size: req.query?.page_size, cursor: req.query?.cursor }),
        ...getObjectFilter(),
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
      return res.status(200).send({ next, previous, results: snakeCaseResults, total_count: totalCount });
    }
  );
}
