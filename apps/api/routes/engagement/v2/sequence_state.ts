import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError, NotImplementedError } from '@supaglue/core/errors';
import { toSnakecasedKeysSequenceState } from '@supaglue/core/mappers/engagement';
import type {
  BatchCreateSequenceStatePathParams,
  BatchCreateSequenceStateRequest,
  BatchCreateSequenceStateResponse,
  CreateSequenceStatePathParams,
  CreateSequenceStateRequest,
  CreateSequenceStateResponse,
  GetSequenceStatePathParams,
  GetSequenceStateQueryParams,
  GetSequenceStateRequest,
  GetSequenceStateResponse,
  ListSequenceStatesPathParams,
  ListSequenceStatesQueryParams,
  ListSequenceStatesRequest,
  ListSequenceStatesResponse,
} from '@supaglue/schemas/v2/engagement';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { managedDataService, engagementCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:sequence_state_id',
    async (
      req: Request<
        GetSequenceStatePathParams,
        GetSequenceStateResponse,
        GetSequenceStateRequest,
        GetSequenceStateQueryParams
      >,
      res: Response<GetSequenceStateResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const mailbox = await engagementCommonObjectService.get(
        'sequence_state',
        connectionId,
        req.params.sequence_state_id
      );
      const snakecasedKeysMailbox = toSnakecasedKeysSequenceState(mailbox);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysMailbox;
      return res.status(200).send(req.query?.include_raw_data ? snakecasedKeysMailbox : rest);
    }
  );

  router.get(
    '/',
    async (
      req: Request<
        ListSequenceStatesPathParams,
        ListSequenceStatesResponse,
        ListSequenceStatesRequest,
        ListSequenceStatesQueryParams
      >,
      res: Response<ListSequenceStatesResponse>
    ) => {
      if (req.query?.read_from_cache?.toString() !== 'true') {
        throw new BadRequestError('Uncached reads not yet implemented for sequence states.');
      }
      const { pagination, records } = await managedDataService.getEngagementSequenceStateRecords(
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

  router.post(
    '/',
    async (
      req: Request<CreateSequenceStatePathParams, CreateSequenceStateResponse, CreateSequenceStateRequest>,
      res: Response<CreateSequenceStateResponse>
    ) => {
      const id = await engagementCommonObjectService.create(
        'sequence_state',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body.record)
      );

      return res.status(201).send({ record: { id } });
    }
  );

  router.post(
    '/_batch',
    async (
      req: Request<
        BatchCreateSequenceStatePathParams,
        BatchCreateSequenceStateResponse,
        BatchCreateSequenceStateRequest
      >,
      res: Response<BatchCreateSequenceStateResponse>
    ) => {
      const ids = await engagementCommonObjectService.batchCreate(
        'sequence_state',
        req.customerConnection,
        req.body.records.map(camelcaseKeysSansCustomFields)
      );

      return res.status(201).send({ records: ids.map((id) => ({ id })) });
    }
  );

  router.patch('/:sequence_state_id', async (req: Request, res: Response) => {
    throw new NotImplementedError();
  });

  app.use('/sequence_states', router);
}
