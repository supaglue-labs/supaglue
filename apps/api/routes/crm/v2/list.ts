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
    '/:object_type',
    async (
      req: Request<ListListsPathParams, ListListsResponse, ListListsRequest, ListListsQueryParams>,
      res: Response<ListListsResponse>
    ) => {
      const { cursor, page_size } = req.query ?? {};
      const { object_type: objectType } = req.params;
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
    '/contact/:list_id',
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
      const { list_id: listId } = req.params;
      const { records, pagination, metadata } = await crmCommonObjectService.listListMembership(
        'contact',
        listId,
        req.customerConnection,
        {
          cursor,
          page_size,
        }
      );

      const snakecasedRecords: SnakecasedKeysCrmContact[] = records.map((record) => toSnakecasedKeysCrmContact(record));

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
  );

  router.get(
    '/account/:list_id',
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
      const { list_id: listId } = req.params;
      const { records, pagination, metadata } = await crmCommonObjectService.listListMembership(
        'account',
        listId,
        req.customerConnection,
        {
          cursor,
          page_size,
        }
      );

      const snakecasedResults: SnakecasedKeysCrmAccount[] = records.map((record) => toSnakecasedKeysCrmAccount(record));

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
        records: snakecasedResults,
      });
    }
  );

  router.get(
    '/lead/:list_id',
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
      const { list_id: listId } = req.params;
      const { records, pagination, metadata } = await crmCommonObjectService.listListMembership(
        'lead',
        listId,
        req.customerConnection,
        {
          cursor,
          page_size,
        }
      );

      const snakecasedResults: SnakecasedKeysCrmLead[] = records.map((record) => toSnakecasedKeysCrmLead(record));

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
        records: snakecasedResults,
      });
    }
  );

  router.get(
    '/opportunity/:list_id',
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
      const { list_id: listId } = req.params;
      const { records, pagination, metadata } = await crmCommonObjectService.listListMembership(
        'opportunity',
        listId,
        req.customerConnection,
        {
          cursor,
          page_size,
        }
      );

      const snakecasedResults: SnakecasedKeysOpportunity[] = records.map((record) =>
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
        records: snakecasedResults,
      });
    }
  );

  app.use('/lists', router);
}
