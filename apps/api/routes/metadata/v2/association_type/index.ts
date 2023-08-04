import { getDependencyContainer } from '@/dependency_container';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { BadRequestError } from '@supaglue/core/errors';
import type {
  CreateAssociationTypePathParams,
  CreateAssociationTypeRequest,
  CreateAssociationTypeResponse,
  GetAssociationTypesPathParams,
  GetAssociationTypesQueryParams,
  GetAssociationTypesRequest,
  GetAssociationTypesResponse,
} from '@supaglue/schemas/v2/metadata';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { metadataService } = getDependencyContainer();

export default function init(app: Router): void {
  const associationTypeRouter = Router();

  associationTypeRouter.use(connectionHeaderMiddleware);

  associationTypeRouter.get(
    '/',
    async (
      req: Request<
        GetAssociationTypesPathParams,
        GetAssociationTypesResponse,
        GetAssociationTypesRequest,
        GetAssociationTypesQueryParams
      >,
      res: Response<GetAssociationTypesResponse>
    ) => {
      const { source_entity_id, target_entity_id } = req.query;

      if (!source_entity_id && !target_entity_id) {
        throw new BadRequestError('Missing required query params');
      }

      const associationTypes = await metadataService.getAssociationTypes(
        req.customerConnection.id,
        source_entity_id,
        target_entity_id
      );
      return res.status(200).send({ results: associationTypes.map(snakecaseKeys) });
    }
  );

  associationTypeRouter.post(
    '/',
    async (
      req: Request<CreateAssociationTypePathParams, CreateAssociationTypeResponse, CreateAssociationTypeRequest>,
      res: Response<CreateAssociationTypeResponse>
    ) => {
      await metadataService.createAssociationType(req.customerConnection.id, camelcaseKeys(req.body));
      return res.status(201).send();
    }
  );

  app.use('/association-types', associationTypeRouter);
}
