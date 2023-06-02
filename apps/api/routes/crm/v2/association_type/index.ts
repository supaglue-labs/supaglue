import { getDependencyContainer } from '@/dependency_container';
import {
  CreateAssociationTypePathParams,
  CreateAssociationTypeRequest,
  CreateAssociationTypeResponse,
  GetAssociationTypesPathParams,
  GetAssociationTypesQueryParams,
  GetAssociationTypesRequest,
  GetAssociationTypesResponse,
} from '@supaglue/schemas/v2/crm';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';
import association from './association';

const { crmAssociationService } = getDependencyContainer();

export default function init(app: Router): void {
  const associationTypeRouter = Router();

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
      const { source_object_class_id, source_object_class_type, target_object_class_id, target_object_class_type } =
        req.query;

      if (
        !source_object_class_id ||
        !source_object_class_type ||
        !target_object_class_id ||
        !target_object_class_type
      ) {
        throw new Error('Missing required query params');
      }

      const associationTypes = await crmAssociationService.getAssociationTypes(
        req.customerConnection.id,
        {
          id: source_object_class_id,
          originType: source_object_class_type,
        },
        {
          id: target_object_class_id,
          originType: target_object_class_type,
        }
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
      await crmAssociationService.createAssociationType(req.customerConnection.id, camelcaseKeys(req.body));
      return res.status(201).send();
    }
  );

  app.use('/association-types', associationTypeRouter);

  const perAssociationTypeRouter = Router({ mergeParams: true });

  association(perAssociationTypeRouter);
  associationTypeRouter.use('/:association_type_id', perAssociationTypeRouter);
}
