import { getDependencyContainer } from '@/dependency_container';
import {
  toSnakecasedKeysCrmAccount,
  toSnakecasedKeysCrmContact,
  toSnakecasedKeysCrmLead,
  toSnakecasedKeysCrmOpportunity,
} from '@supaglue/core/mappers/crm';
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
import type {
  SnakecasedKeysCrmAccount,
  SnakecasedKeysCrmContact,
  SnakecasedKeysCrmLead,
  SnakecasedKeysOpportunity,
} from '@supaglue/types/crm';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { crmCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<ListListsPathParams, ListListsResponse, ListListsRequest, ListListsQueryParams>,
      res: Response<ListListsResponse>
    ) => {
      const { cursor, page_size } = req.query ?? {};
      const { object_type: objectType } = req.query;
      const { records, pagination } = await crmCommonObjectService.listLists(objectType, req.customerConnection, {
        cursor,
        page_size,
      });

      // TODO: add mappers
      return res.status(200).send({
        pagination,
        records: records.map(({ objectType, rawData, ...rest }) => ({
          ...rest,
          object_type: objectType,
          raw_data: rawData,
        })),
      });
    }
  );

  router.get(
    '/:list_id',
    async (
      req: Request<
        GetListMembershipPathParams,
        GetListMembershipResponse,
        GetListMembershipRequest,
        GetListMembershipQueryParams
      >,
      res: Response<GetListMembershipResponse>
    ) => {
      const { cursor, page_size, object_type: objectType } = req.query ?? {};
      const { list_id: listId } = req.params;

      switch (objectType) {
        case 'contact': {
          const { records, pagination, metadata } = await crmCommonObjectService.listListMembership(
            objectType,
            listId,
            req.customerConnection,
            {
              cursor,
              page_size,
            }
          );

          const snakecasedRecords: SnakecasedKeysCrmContact[] = records.map((record) =>
            toSnakecasedKeysCrmContact(record)
          );

          // TODO: add mappers
          return res.status(200).send({
            pagination,
            metadata: {
              object_type: metadata.objectType,
              raw_data: metadata.rawData,
              id: metadata.id,
              name: metadata.name,
              label: metadata.label,
            },
            records: snakecasedRecords,
          });
        }
        case 'account': {
          const { records, pagination, metadata } = await crmCommonObjectService.listListMembership(
            objectType,
            listId,
            req.customerConnection,
            {
              cursor,
              page_size,
            }
          );

          const snakecasedRecords: SnakecasedKeysCrmAccount[] = records.map((record) =>
            toSnakecasedKeysCrmAccount(record)
          );

          // TODO: add mappers
          return res.status(200).send({
            pagination,
            metadata: {
              object_type: metadata.objectType,
              raw_data: metadata.rawData,
              id: metadata.id,
              name: metadata.name,
              label: metadata.label,
            },
            records: snakecasedRecords,
          });
        }
        case 'lead': {
          const { records, pagination, metadata } = await crmCommonObjectService.listListMembership(
            objectType,
            listId,
            req.customerConnection,
            {
              cursor,
              page_size,
            }
          );

          const snakecasedRecords: SnakecasedKeysCrmLead[] = records.map((record) => toSnakecasedKeysCrmLead(record));

          // TODO: add mappers
          return res.status(200).send({
            pagination,
            metadata: {
              object_type: metadata.objectType,
              raw_data: metadata.rawData,
              id: metadata.id,
              name: metadata.name,
              label: metadata.label,
            },
            records: snakecasedRecords,
          });
        }
        case 'opportunity': {
          const { records, pagination, metadata } = await crmCommonObjectService.listListMembership(
            objectType,
            listId,
            req.customerConnection,
            {
              cursor,
              page_size,
            }
          );

          const snakecasedRecords: SnakecasedKeysOpportunity[] = records.map((record) =>
            toSnakecasedKeysCrmOpportunity(record)
          );

          // TODO: add mappers
          return res.status(200).send({
            pagination,
            metadata: {
              object_type: metadata.objectType,
              raw_data: metadata.rawData,
              id: metadata.id,
              name: metadata.name,
              label: metadata.label,
            },
            records: snakecasedRecords,
          });
        }
      }
    }
  );

  app.use('/lists', router);
}
