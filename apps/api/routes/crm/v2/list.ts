import { getDependencyContainer } from '@/dependency_container';
import type {
  GetListMembershipPathParams,
  GetListMembershipQueryParams,
  GetListMembershipRequest,
  GetListMembershipResponse,
  ListListsPathParams,
  ListListsQueryParams,
  ListListsRequest,
  ListListsResponse,
} from '@supaglue/schemas/v2/crm';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { crmCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:object_type',
    async (
      req: Request<ListListsPathParams, ListListsResponse, ListListsRequest, ListListsQueryParams>,
      res: Response<ListListsResponse>
    ) => {
      const { cursor, page_size } = req.query ?? {};
      const { object_type: objectType } = req.params;
      const { results, totalCount, ...rest } = await crmCommonObjectService.listLists(
        objectType,
        req.customerConnection,
        {
          cursor,
          page_size,
        }
      );

      return res.status(200).send({
        ...rest,
        total_count: totalCount,
        results: results.map(({ objectType, rawData, ...rest }) => ({
          ...rest,
          object_type: objectType,
          raw_data: rawData,
        })),
      });
    }
  );

  router.get(
    '/:object_type/:list_id',
    async (
      req: Request<
        GetListMembershipPathParams,
        GetListMembershipResponse,
        GetListMembershipRequest,
        GetListMembershipQueryParams
      >,
      res: Response<GetListMembershipResponse>
    ) => {
      const { cursor, page_size } = req.query ?? {};
      const { object_type: objectType, list_id: listId } = req.params;
      const { results, totalCount, metadata, ...rest } = await crmCommonObjectService.listListMembership(
        objectType,
        listId,
        req.customerConnection,
        {
          cursor,
          page_size,
        }
      );

      return res.status(200).send({
        ...rest,
        total_count: totalCount,
        metadata: {
          object_type: metadata.objectType,
          raw_data: metadata.rawData,
          id: metadata.id,
          name: metadata.name,
          label: metadata.label,
        },
        results: results.map(({ rawData, ...rest }) => ({
          ...rest,
          raw_data: rawData,
        })),
      });
    }
  );

  app.use('/lists', router);
}
