import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError } from '@supaglue/core/errors';
import { toSnakecasedKeysCrmUser } from '@supaglue/core/mappers/crm';
import { toMappedProperties } from '@supaglue/core/remotes/utils/properties';
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
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { managedDataService, connectionService, crmCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:user_id',
    async (
      req: Request<GetUserPathParams, GetUserResponse, GetUserRequest, GetUserQueryParams>,
      res: Response<GetUserResponse>
    ) => {
      const user = await crmCommonObjectService.get('user', req.customerConnection, req.params.user_id);
      const snakecasedKeysUser = toSnakecasedKeysCrmUser(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysUser;
      return res.status(200).send(req.query?.include_raw_data?.toString() === 'true' ? snakecasedKeysUser : rest);
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
      const includeRawData = req.query?.include_raw_data?.toString() === 'true';
      const { pagination, records } = await managedDataService.getCrmUserRecords(
        req.supaglueApplication.id,
        req.customerConnection.providerName,
        req.customerId,
        req.query?.cursor,
        req.query?.modified_after as unknown as string | undefined,
        req.query?.page_size ? parseInt(req.query.page_size) : undefined
      );
      let fieldMappingConfig: FieldMappingConfig | undefined = undefined;
      if (includeRawData) {
        fieldMappingConfig = await connectionService.getFieldMappingConfig(req.customerConnection.id, 'common', 'user');
      }
      return res.status(200).send({
        pagination,
        records: records.map((record) => ({
          ...record,
          raw_data:
            includeRawData && fieldMappingConfig ? toMappedProperties(record.raw_data, fieldMappingConfig) : undefined,
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
