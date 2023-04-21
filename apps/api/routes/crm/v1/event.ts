import { getDependencyContainer } from '@/dependency_container';
import { stringOrNullOrUndefinedToDate } from '@/lib/date';
import { toSnakecasedKeysEvent } from '@supaglue/core/mappers/event';
import {
  CreateEventPathParams,
  CreateEventQueryParams,
  CreateEventRequest,
  CreateEventResponse,
  UpdateEventPathParams,
  UpdateEventQueryParams,
  UpdateEventRequest,
  UpdateEventResponse,
} from '@supaglue/schemas/crm';
import { camelcaseKeysSansCustomFields } from '@supaglue/utils/camelcase';
import { Request, Response, Router } from 'express';

const { commonModelService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.post<string, CreateEventPathParams, CreateEventResponse, CreateEventRequest, CreateEventQueryParams>(
    '/',
    async (
      req: Request<CreateEventPathParams, CreateEventResponse, CreateEventRequest>,
      res: Response<CreateEventResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const originalParams = camelcaseKeysSansCustomFields(req.body.model);
      const eventCreateParams = {
        ...originalParams,
        startTime: stringOrNullOrUndefinedToDate(originalParams.startTime),
        endTime: stringOrNullOrUndefinedToDate(originalParams.endTime),
      };
      const event = await commonModelService.create('event', connectionId, eventCreateParams);
      return res.status(200).send({ model: toSnakecasedKeysEvent(event) });
    }
  );

  router.patch<string, UpdateEventPathParams, UpdateEventResponse, UpdateEventRequest, UpdateEventQueryParams>(
    '/:event_id',
    async (
      req: Request<UpdateEventPathParams, UpdateEventResponse, UpdateEventRequest>,
      res: Response<UpdateEventResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const originalParams = camelcaseKeysSansCustomFields(req.body.model);
      const eventUpdateParams = {
        ...originalParams,
        startTime: stringOrNullOrUndefinedToDate(originalParams.startTime),
        endTime: stringOrNullOrUndefinedToDate(originalParams.endTime),
      };
      const event = await commonModelService.update('event', connectionId, {
        remoteId: req.params.event_id,
        ...eventUpdateParams,
      });
      return res.status(200).send({ model: toSnakecasedKeysEvent(event) });
    }
  );

  app.use('/events', router);
}
