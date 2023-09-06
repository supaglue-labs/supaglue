import { getDependencyContainer } from '@/dependency_container';
import type {
  GetFormFieldsPathParams,
  GetFormFieldsQueryParams,
  GetFormFieldsRequest,
  GetFormFieldsResponse,
  ListFormsPathParams,
  ListFormsQueryParams,
  ListFormsRequest,
  ListFormsResponse,
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

  router.get(
    '/',
    async (
      req: Request<ListFormsPathParams, ListFormsResponse, ListFormsRequest, ListFormsQueryParams>,
      res: Response<ListFormsResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const data = await marketingAutomationCommonObjectService.listForms(connectionId);
      return res.status(200).send({
        forms: data.map((form) => ({
          id: form.id,
          name: form.name,
          created_at: form.createdAt,
          updated_at: form.updatedAt,
          raw_data: req.query.include_raw_data === 'true' ? form.rawData : undefined,
        })),
      });
    }
  );

  router.get(
    '/:form_id/_fields',
    async (
      req: Request<GetFormFieldsPathParams, GetFormFieldsResponse, GetFormFieldsRequest, GetFormFieldsQueryParams>,
      res: Response<GetFormFieldsResponse>
    ) => {
      const { id: connectionId } = req.customerConnection;
      const data = await marketingAutomationCommonObjectService.getFormFields(connectionId, req.params.form_id);
      return res.status(200).send({
        fields: data.map((field) => ({
          id: field.id,
          name: field.name,
          required: field.required,
          form_id: field.formId,
          data_format: field.dataFormat,
          validation_message: field.validationMessage,
          raw_data: req.query.include_raw_data === 'true' ? field.rawData : undefined,
        })),
      });
    }
  );

  app.use('/forms', router);
}
