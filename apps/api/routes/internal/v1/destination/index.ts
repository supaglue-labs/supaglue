import { getDependencyContainer } from '@/dependency_container';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { Router } from 'express';

const { destinationService } = getDependencyContainer();

export default function init(app: Router): void {
  const destinationRouter = Router({ mergeParams: true });

  destinationRouter.get('/', async (req, res) => {
    const destinations = await destinationService.getDestinationsByApplicationId(req.supaglueApplication.id);
    return res.status(200).send(destinations);
  });

  destinationRouter.get('/:destination_id', async (req, res) => {
    const destination = await destinationService.getDestinationById(req.params.destination_id);
    return res.status(200).send(destination);
  });

  destinationRouter.post('/', async (req, res) => {
    const destination = await destinationService.createDestination({
      applicationId: req.supaglueApplication.id,
      ...camelcaseKeys(req.body),
    });
    return res.status(200).send(destination);
  });

  destinationRouter.put('/:destination_id', async (req, res) => {
    const destination = await destinationService.updateDestination({
      id: req.params.destination_id,
      ...camelcaseKeys(req.body),
    });
    return res.status(200).send(destination);
  });

  app.use('/destinations', destinationRouter);
}
