import { getDependencyContainer } from '@/dependency_container';
import { camelcaseKeys } from '@/lib/camelcase';
import { snakecaseKeys } from '@supaglue/core/lib/snakecase';
import {
  DeleteCustomerPathParams,
  DeleteCustomerRequest,
  DeleteCustomerResponse,
  GetCustomerPathParams,
  GetCustomerRequest,
  GetCustomerResponse,
  GetCustomersPathParams,
  GetCustomersRequest,
  UpsertCustomerPathParams,
  UpsertCustomerRequest,
  UpsertCustomerResponse,
} from '@supaglue/schemas/mgmt';
import { Request, Response, Router } from 'express';
import connection from './connection/index';

const { customerService } = getDependencyContainer();

export default function init(app: Router): void {
  const customerRouter = Router();

  customerRouter.get(
    '/',
    async (
      req: Request<GetCustomersPathParams, any, GetCustomersRequest>,
      res: Response // TODO: this response differs from the public /mgmt because we return a joined relation.
      // We need to decide if we want openapi for internal endpoints or use something like tRPC or GraphQL
    ) => {
      const customers = await customerService.listExpandedSafe();
      return res.status(200).send(customers.map(snakecaseKeys));
    }
  );

  // TODO: do we want non-upsert create/update endpoints?

  customerRouter.put(
    '/',
    async (
      req: Request<UpsertCustomerPathParams, UpsertCustomerResponse, UpsertCustomerRequest>,
      res: Response<UpsertCustomerResponse>
    ) => {
      const customer = await customerService.upsert(camelcaseKeys(req.body));
      return res.status(201).send(snakecaseKeys(customer));
    }
  );

  // TODO: consider fetching by external_identifier instead of internal id
  customerRouter.get(
    '/:customer_id',
    async (
      req: Request<GetCustomerPathParams, GetCustomerResponse, GetCustomerRequest>,
      res: Response<GetCustomerResponse>
    ) => {
      const customer = await customerService.getById(req.params.customer_id);
      return res.status(200).send(snakecaseKeys(customer));
    }
  );

  // TODO: consider fetching by external_identifier instead of internal id
  customerRouter.delete(
    '/:customer_id',
    async (
      req: Request<DeleteCustomerPathParams, DeleteCustomerResponse, DeleteCustomerRequest>,
      res: Response<DeleteCustomerResponse>
    ) => {
      const customer = await customerService.delete(req.params.customer_id);
      return res.status(200).send(snakecaseKeys(customer));
    }
  );

  app.use('/customers', customerRouter);

  const perCustomerRouter = Router({ mergeParams: true });

  connection(perCustomerRouter);
  customerRouter.use('/:customer_id', perCustomerRouter);
}
