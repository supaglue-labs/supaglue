import { getDependencyContainer } from '@/dependency_container';
import { stringOrNullOrUndefinedToDate } from '@/lib/date';
import { toSnakecasedKeysEvent } from '@supaglue/core/mappers/event';
import { toListInternalParams } from '@supaglue/core/mappers/list_params';
import {
  CreateEventPathParams,
  CreateEventRequest,
  CreateEventResponse,
  GetEventPathParams,
  GetEventQueryParams,
  GetEventRequest,
  GetEventResponse,
  GetEventsPathParams,
  GetEventsRequest,
  GetEventsResponse,
  UpdateEventPathParams,
  UpdateEventQueryParams,
  UpdateEventRequest,
  UpdateEventResponse,
} from '@supaglue/schemas/crm';
import { ListParams } from '@supaglue/types';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import { Request, Response, Router } from 'express';

const { eventService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<GetEventsPathParams, GetEventsResponse, GetEventsRequest, /* GetEventsQueryParams */ ListParams>,
      res: Response<GetEventsResponse>
    ) => {
      const { next, previous, results } = await eventService.list(
        req.customerConnection.id,
        toListInternalParams(req.query)
      );
      const snakeCaseKeysResults = results.map(toSnakecasedKeysEvent);
      return res.status(200).send({ next, previous, results: snakeCaseKeysResults });
    }
  );

  router.get(
    '/:event_id',
    async (req: Request<GetEventPathParams, GetEventResponse, GetEventRequest>, res: Response<GetEventResponse>) => {
      const event = await eventService.getById(req.params.event_id, req.customerConnection.id);
      return res.status(200).send(toSnakecasedKeysEvent(event));
    }
  );

  router.post<string, CreateEventPathParams, CreateEventResponse, CreateEventRequest, GetEventQueryParams>(
    '/',
    async (
      req: Request<CreateEventPathParams, CreateEventResponse, CreateEventRequest>,
      res: Response<CreateEventResponse>
    ) => {
      const { customerId, id: connectionId } = req.customerConnection;
      const originalParams = camelcaseKeysSansCustomFields(req.body.model);
      const eventCreateParams = {
        ...originalParams,
        startTime: stringOrNullOrUndefinedToDate(originalParams.startTime),
        endTime: stringOrNullOrUndefinedToDate(originalParams.endTime),
      };
      const event = await eventService.create(customerId, connectionId, eventCreateParams);
      return res.status(200).send({ model: toSnakecasedKeysEvent(event) });
    }
  );

  router.patch<string, UpdateEventPathParams, UpdateEventResponse, UpdateEventRequest, UpdateEventQueryParams>(
    '/:event_id',
    async (
      req: Request<UpdateEventPathParams, UpdateEventResponse, UpdateEventRequest>,
      res: Response<UpdateEventResponse>
    ) => {
      const { customerId, id: connectionId } = req.customerConnection;
      const originalParams = camelcaseKeysSansCustomFields(req.body.model);
      const eventUpdateParams = {
        ...originalParams,
        startTime: stringOrNullOrUndefinedToDate(originalParams.startTime),
        endTime: stringOrNullOrUndefinedToDate(originalParams.endTime),
      };
      const event = await eventService.update(customerId, connectionId, {
        id: req.params.event_id,
        ...eventUpdateParams,
      });
      return res.status(200).send({ model: toSnakecasedKeysEvent(event) });
    }
  );

  router.post('/_search', async () => {
    throw new Error('Not implemented');
  });

  router.delete('/:event_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/events', router);
}
