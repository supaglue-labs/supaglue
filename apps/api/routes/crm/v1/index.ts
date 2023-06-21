import { Router } from 'express';
import passthrough from './passthrough';

export default function init(app: Router): void {
  const v1Router = Router();

  passthrough(v1Router);

  app.use('/v1', v1Router);
}
