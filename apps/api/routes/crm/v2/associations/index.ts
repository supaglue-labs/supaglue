import { NotImplementedError } from '@supaglue/core/errors';
import type {
  ListAssociationsPathParams,
  ListAssociationsQueryParams,
  ListAssociationsRequest,
  ListAssociationsResponse,
  UpsertAssociationPathParams,
  UpsertAssociationRequest,
  UpsertAssociationResponse,
} from '@supaglue/schemas/v2/crm';
import type { Request, Response } from 'express';
import { Router } from 'express';

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:object_name/records',
    async (
      req: Request<
        ListAssociationsPathParams,
        ListAssociationsResponse,
        ListAssociationsRequest,
        ListAssociationsQueryParams
      >,
      res: Response<ListAssociationsResponse>
    ) => {
      throw new NotImplementedError();
    }
  );

  router.put(
    '/',
    async (
      req: Request<UpsertAssociationPathParams, UpsertAssociationResponse, UpsertAssociationRequest>,
      res: Response<UpsertAssociationResponse>
    ) => {
      throw new NotImplementedError();
    }
  );

  app.use('/associations', router);
}
