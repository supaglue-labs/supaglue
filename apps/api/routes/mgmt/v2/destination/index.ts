import { getDependencyContainer } from '@/dependency_container';
import type {
  CreateDestinationPathParams,
  CreateDestinationRequest,
  CreateDestinationResponse,
  GetDestinationPathParams,
  GetDestinationRequest,
  GetDestinationResponse,
  GetDestinationsPathParams,
  GetDestinationsRequest,
  GetDestinationsResponse,
  UpdateDestinationPathParams,
  UpdateDestinationRequest,
  UpdateDestinationResponse,
} from '@supaglue/schemas/v2/mgmt';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { destinationService } = getDependencyContainer();

export default function init(app: Router): void {
  const destinationRouter = Router({ mergeParams: true });

  destinationRouter.get(
    '/',
    async (
      req: Request<GetDestinationsPathParams, GetDestinationsResponse, GetDestinationsRequest>,
      res: Response<GetDestinationsResponse>
    ) => {
      const destinations = await destinationService.getDestinationsByApplicationId(req.supaglueApplication.id);
      return res.status(200).send(destinations.map(snakecaseKeys));
    }
  );

  destinationRouter.get(
    '/:destination_id',
    async (
      req: Request<GetDestinationPathParams, GetDestinationResponse, GetDestinationRequest>,
      res: Response<GetDestinationResponse>
    ) => {
      const destination = await destinationService.getDestinationById(req.params.destination_id);
      return res.status(200).send(snakecaseKeys(destination));
    }
  );

  destinationRouter.post(
    '/',
    async (
      req: Request<CreateDestinationPathParams, CreateDestinationResponse, CreateDestinationRequest>,
      res: Response<CreateDestinationResponse>
    ) => {
      const destination = await destinationService.createDestination({
        applicationId: req.supaglueApplication.id,
        ...camelcaseKeys(req.body),
      });
      return res.status(200).send(snakecaseKeys(destination));
    }
  );

  destinationRouter.put(
    '/:destination_id',
    async (
      req: Request<UpdateDestinationPathParams, UpdateDestinationResponse, UpdateDestinationRequest>,
      res: Response<UpdateDestinationResponse>
    ) => {
      const destination = await destinationService.updateDestination({
        id: req.params.destination_id,
        applicationId: req.supaglueApplication.id,
        ...camelcaseKeys(req.body),
      });
      return res.status(200).send(snakecaseKeys(destination));
    }
  );

  app.use('/destinations', destinationRouter);
}
