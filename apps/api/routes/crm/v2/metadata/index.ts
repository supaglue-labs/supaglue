import { Router } from 'express';
import associations from './associations';
import customObjects from './custom_objects';

export default function init(app: Router): void {
  const metadataRouter = Router();

  associations(metadataRouter);
  customObjects(metadataRouter);

  app.use('/metadata', metadataRouter);
}
