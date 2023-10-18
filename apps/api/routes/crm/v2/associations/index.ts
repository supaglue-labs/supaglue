import { getDependencyContainer } from '@/dependency_container';
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

const { associationService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<
        ListAssociationsPathParams,
        ListAssociationsResponse,
        ListAssociationsRequest,
        ListAssociationsQueryParams
      >,
      res: Response<ListAssociationsResponse>
    ) => {
      const associations = await associationService.listAssociations(req.customerConnection, {
        sourceRecord: {
          id: req.query.source_record_id,
          objectName: req.query.source_object,
        },
        targetObject: req.query.target_object,
      });
      return res.status(200).send({
        results: associations.map(({ sourceRecord, targetRecord, associationSchemaId }) => ({
          source_record_id: sourceRecord.id,
          source_object: sourceRecord.objectName,
          target_record_id: targetRecord.id,
          target_object: targetRecord.objectName,
          association_schema_id: associationSchemaId,
        })),
      });
    }
  );

  router.put(
    '/',
    async (
      req: Request<UpsertAssociationPathParams, UpsertAssociationResponse, UpsertAssociationRequest>,
      res: Response<UpsertAssociationResponse>
    ) => {
      const association = await associationService.createAssociation(req.customerConnection, {
        sourceRecord: {
          id: req.body.source_record_id,
          objectName: req.body.source_object,
        },
        targetRecord: {
          id: req.body.target_record_id,
          objectName: req.body.target_object,
        },
        associationSchemaId: req.body.association_schema_id,
      });
      return res.status(201).send({
        association: {
          source_record_id: association.sourceRecord.id,
          source_object: association.sourceRecord.objectName,
          target_record_id: association.targetRecord.id,
          target_object: association.targetRecord.objectName,
          association_schema_id: association.associationSchemaId,
        },
      });
    }
  );

  app.use('/associations', router);
}
