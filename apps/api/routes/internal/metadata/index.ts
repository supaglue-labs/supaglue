import { Router } from 'express';
import object from '../../metadata/v2/object';

export default function init(app: Router): void {
  const metadataRouter = Router();

  object(metadataRouter);

  app.use('/metadata', metadataRouter);
}
