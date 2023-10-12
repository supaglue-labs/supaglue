import { getDependencyContainer } from '@/dependency_container';
import { addLogContext } from '@supaglue/core/lib/logger';
import type {
  SendPassthroughRequestPathParams,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/schemas/v2/crm';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { passthroughService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  // Deprecated: Use /actions/v2/passthrough instead.
  router.post(
    '/',
    async (
      req: Request<SendPassthroughRequestPathParams, SendPassthroughRequestResponse, SendPassthroughRequestRequest>,
      res: Response<SendPassthroughRequestResponse>
    ) => {
      const response = await passthroughService.send(req.customerConnection.id, req.body);
      addLogContext('passthrough', {
        method: req.body.method,
        path: req.body.path,
        headers: req.body.headers,
        query: req.body.query,
      });
      return res.status(200).send(response);
    }
  );

  app.use('/passthrough', router);
}
