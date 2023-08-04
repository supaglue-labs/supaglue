import { getDependencyContainer } from '@/dependency_container';
import type {
  CreateAssociationPathParams,
  CreateAssociationRequest,
  CreateAssociationResponse,
  GetAssociationsPathParams,
  GetAssociationsQueryParams,
  GetAssociationsRequest,
  GetAssociationsResponse,
} from '@supaglue/schemas/v2/actions';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { entityRecordService } = getDependencyContainer();

export default function init(app: Router): void {
  const associationRouter = Router({ mergeParams: true });

  associationRouter.get(
    '/',
    async (
      req: Request<
        GetAssociationsPathParams,
        GetAssociationsResponse,
        GetAssociationsRequest,
        GetAssociationsQueryParams
      >,
      res: Response<GetAssociationsResponse>
    ) => {
      const associations = await entityRecordService.listAssociations(req.customerConnection.id, {
        sourceRecord: {
          id: req.query.source_record_id,
          entityId: req.query.source_entity_id,
        },
        targetEntityId: req.query.target_entity_id,
      });
      return res.status(201).send({ results: associations.map(snakecaseKeys) });
    }
  );

  associationRouter.put(
    '/',
    async (
      req: Request<CreateAssociationPathParams, CreateAssociationResponse, CreateAssociationRequest>,
      res: Response<CreateAssociationResponse>
    ) => {
      const association = await entityRecordService.createAssociation(
        req.customerConnection.id,
        camelcaseKeys(req.body)
      );
      return res.status(201).send({ association: snakecaseKeys(association) });
    }
  );

  app.use('/associations', associationRouter);
}
