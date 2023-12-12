import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError } from '@supaglue/core/errors';
import { toSnakecasedKeysCrmUser } from '@supaglue/core/mappers/crm';
import type {
  GetUserPathParams,
  GetUserQueryParams,
  GetUserRequest,
  GetUserResponse,
  ListUsersPathParams,
  ListUsersQueryParams,
  ListUsersRequest,
  ListUsersResponse,
} from '@supaglue/schemas/v2/crm';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { managedDataService, crmCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:user_id',
    async (
      req: Request<GetUserPathParams, GetUserResponse, GetUserRequest, GetUserQueryParams>,
      res: Response<GetUserResponse>
    ) => {
      const user = await crmCommonObjectService.get('user', req.customerConnection, req.params.user_id, {
        includeRawData: req.query?.include_raw_data?.toString() === 'true',
      });
      return res.status(200).send(toSnakecasedKeysCrmUser(user));
    }
  );

  router.get(
    '/',
    async (
      req: Request<ListUsersPathParams, ListUsersResponse, ListUsersRequest, ListUsersQueryParams>,
      res: Response<ListUsersResponse>
    ) => {
      const includeRawData = req.query?.include_raw_data?.toString() === 'true';

      if (req.query?.read_from_cache?.toString() !== 'true') {
        const { pagination, records } = await crmCommonObjectService.list('user', req.customerConnection, {
          modifiedAfter: req.query?.modified_after,
          cursor: req.query?.cursor,
          includeRawData,
          pageSize: req.query?.page_size ? parseInt(req.query.page_size) : undefined,
        });
        return res.status(200).send({
          pagination,
          records: records.map(toSnakecasedKeysCrmUser),
        });
      }
      return res
        .status(200)
        .send(
          await managedDataService.getCrmUserRecords(
            req.supaglueApplication.id,
            req.customerConnection.providerName,
            req.customerConnection.id,
            req.customerId,
            req.query?.cursor,
            req.query?.modified_after as unknown as string | undefined,
            req.query?.page_size ? parseInt(req.query.page_size) : undefined,
            includeRawData
          )
        );
    }
  );

  router.post('/', async (req: Request, res: Response) => {
    throw new BadRequestError('POST not supported for /users');
  });

  router.patch('/:mailbox_id', async (req: Request, res: Response) => {
    throw new BadRequestError('PATCH not supported for /users');
  });

  app.use('/users', router);
}
