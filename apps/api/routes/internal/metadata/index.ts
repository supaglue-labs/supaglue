import { Router } from 'express';
import associationType from '../../metadata/v2/association_type';
import object from '../../metadata/v2/object';

export default function init(app: Router): void {
  const metadataRouter = Router();

  associationType(metadataRouter);
  object(metadataRouter);

  app.use('/metadata', metadataRouter);
}
