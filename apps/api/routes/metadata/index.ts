import { Router } from 'express';
import v2 from './v2';

export default function init(app: Router): void {
  const metadataRouter = Router();

  v2(metadataRouter);

  app.use('/metadata', metadataRouter);
}
