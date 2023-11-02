import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError } from '@supaglue/core/errors';
import { toSnakecasedKeysEngagementUser } from '@supaglue/core/mappers/engagement';
import type {
  GetUserPathParams,
  GetUserQueryParams,
  GetUserRequest,
  GetUserResponse,
  ListUsersPathParams,
  ListUsersQueryParams,
  ListUsersRequest,
  ListUsersResponse,
} from '@supaglue/schemas/v2/engagement';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { engagementCommonObjectService, managedDataService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:user_id',
    async (
      req: Request<GetUserPathParams, GetUserResponse, GetUserRequest, GetUserQueryParams>,
      res: Response<GetUserResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const user = await engagementCommonObjectService.get('user', connectionId, req.params.user_id);
      const snakecasedKeysUser = toSnakecasedKeysEngagementUser(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysUser;
      return res.status(200).send(req.query?.include_raw_data ? snakecasedKeysUser : rest);
    }
  );

  router.get(
    '/',
    async (
      req: Request<ListUsersPathParams, ListUsersResponse, ListUsersRequest, ListUsersQueryParams>,
      res: Response<ListUsersResponse>
    ) => {
      if (req.query?.read_from_cache?.toString() !== 'true') {
        throw new BadRequestError('Uncached reads not yet implemented for users.');
      }
      const { pagination, records } = await managedDataService.getEngagementUserRecords(
        req.supaglueApplication.id,
        req.customerConnection.providerName,
        req.customerId,
        req.query?.cursor,
        req.query?.modified_after as unknown as string | undefined,
        req.query?.page_size ? parseInt(req.query.page_size) : undefined
      );
      return res.status(200).send({
        pagination,
        records: records.map((record) => ({
          ...record,
          raw_data: req.query?.include_raw_data ? record.raw_data : undefined,
          _supaglue_application_id: undefined,
          _supaglue_customer_id: undefined,
          _supaglue_provider_name: undefined,
          _supaglue_emitted_at: undefined,
        })),
      });
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
