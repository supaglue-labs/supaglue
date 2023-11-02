import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError, NotImplementedError } from '@supaglue/core/errors';
import { toSnakecasedKeysSequence } from '@supaglue/core/mappers/engagement';
import type {
  CreateSequencePathParams,
  CreateSequenceRequest,
  CreateSequenceResponse,
  CreateSequenceStepPathParams,
  CreateSequenceStepRequest,
  CreateSequenceStepResponse,
  GetSequencePathParams,
  GetSequenceRequest,
  GetSequenceResponse,
  ListSequencesPathParams,
  ListSequencesQueryParams,
  ListSequencesRequest,
  ListSequencesResponse,
} from '@supaglue/schemas/v2/engagement';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { managedDataService, engagementCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:sequence_id',
    async (
      req: Request<GetSequencePathParams, GetSequenceResponse, GetSequenceRequest>,
      res: Response<GetSequenceResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const sequence = await engagementCommonObjectService.get('sequence', connectionId, req.params.sequence_id);
      const snakecasedKeysSequence = toSnakecasedKeysSequence(sequence);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_data, ...rest } = snakecasedKeysSequence;
      return res.status(200).send(req.query?.include_raw_data ? snakecasedKeysSequence : rest);
    }
  );

  router.get(
    '/',
    async (
      req: Request<ListSequencesPathParams, ListSequencesResponse, ListSequencesRequest, ListSequencesQueryParams>,
      res: Response<ListSequencesResponse>
    ) => {
      if (req.query?.read_from_cache?.toString() !== 'true') {
        throw new BadRequestError('Uncached reads not yet implemented for sequences.');
      }
      const { pagination, records } = await managedDataService.getEngagementSequenceRecords(
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
      req: Request<CreateSequencePathParams, CreateSequenceResponse, CreateSequenceRequest>,
      res: Response<CreateSequenceResponse>
    ) => {
      const id = await engagementCommonObjectService.create(
        'sequence',
        req.customerConnection,
        camelcaseKeysSansCustomFields(req.body.record)
      );
      return res.status(201).send({ record: { id } });
    }
  );

  router.post(
    '/:sequence_id/sequence_steps',
    async (
      req: Request<CreateSequenceStepPathParams, CreateSequenceStepResponse, CreateSequenceStepRequest>,
      res: Response<CreateSequenceStepResponse>
    ) => {
      const id = await engagementCommonObjectService.create('sequence_step', req.customerConnection, {
        ...camelcaseKeysSansCustomFields(req.body.record),
        sequenceId: req.params.sequence_id,
      });
      return res.status(201).send({ record: { id } });
    }
  );

  router.patch('/:sequence_id', async (req: Request, res: Response) => {
    throw new NotImplementedError();
  });

  app.use('/sequences', router);
}
