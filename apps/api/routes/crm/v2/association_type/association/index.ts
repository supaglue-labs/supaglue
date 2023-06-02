import { getDependencyContainer } from '@/dependency_container';
import {
  CreateAssociationPathParams,
  CreateAssociationRequest,
  CreateAssociationResponse,
} from '@supaglue/schemas/v2/crm';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';

const { crmAssociationService } = getDependencyContainer();

export default function init(app: Router): void {
  const associationRouter = Router({ mergeParams: true });

  associationRouter.put(
    '/',
    async (
      req: Request<CreateAssociationPathParams, CreateAssociationResponse, CreateAssociationRequest>,
      res: Response<CreateAssociationResponse>
    ) => {
      const association = await crmAssociationService.createAssociation(req.customerConnection.id, {
        associationTypeId: req.params.association_type_id,
        ...camelcaseKeys(req.body),
      });
      return res.status(201).send({ association: snakecaseKeys(association) });
    }
  );

  app.use('/associations', associationRouter);
}
