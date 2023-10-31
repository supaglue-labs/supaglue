import { getDependencyContainer } from '@/dependency_container';
import type {
  ListStandardObjectSchemasPathParams,
  ListStandardObjectSchemasRequest,
  ListStandardObjectSchemasResponse,
} from '@supaglue/schemas/v2/crm';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { metadataService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<
        ListStandardObjectSchemasPathParams,
        ListStandardObjectSchemasResponse,
        ListStandardObjectSchemasRequest
      >,
      res: Response<ListStandardObjectSchemasResponse>
    ) => {
      const standardObjects = await metadataService.listStandardObjectSchemas(req.customerConnection.id);
      return res.status(200).send(standardObjects);
    }
  );

  app.use('/standard_objects', router);
}
