import { getDependencyContainer } from '@/dependency_container';
import type {
  SubmitFormPathParams,
  SubmitFormQueryParams,
  SubmitFormRequest,
  SubmitFormResponse,
} from '@supaglue/schemas/v2/marketing-automation';
import { snakecaseKeys } from '@supaglue/utils';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { marketingAutomationCommonObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.post(
    '/:form_id/_submit',
    async (
      req: Request<SubmitFormPathParams, SubmitFormQueryParams, SubmitFormRequest, SubmitFormResponse>,
      res: Response<SubmitFormResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const data = await marketingAutomationCommonObjectService.submitForm(
        connectionId,
        req.params.form_id,
        req.body.formFields
      );
      return res.status(200).send(snakecaseKeys(data));
    }
  );

  app.use('/forms', router);
}
