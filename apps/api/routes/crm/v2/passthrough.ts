import { getDependencyContainer } from '@/dependency_container';
import {
  SendPassthroughRequestPathParams,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/schemas/v1/crm';
import { Request, Response, Router } from 'express';

const { passthroughService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.post(
    '/',
    async (
      req: Request<SendPassthroughRequestPathParams, SendPassthroughRequestResponse, SendPassthroughRequestRequest>,
      res: Response<SendPassthroughRequestResponse>
    ) => {
      const response = await passthroughService.send(req.customerConnection.id, req.body);
      return res.status(200).send(response);
    }
  );

  app.use('/passthrough', router);
}
