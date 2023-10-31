import { Router } from 'express';
import associations from './associations';
import customObjects from './custom_objects';
import properties from './properties';
import standardObjects from './standard_objects';

export default function init(app: Router): void {
  const metadataRouter = Router();

  associations(metadataRouter);
  customObjects(metadataRouter);
  standardObjects(metadataRouter);
  properties(metadataRouter);

  app.use('/metadata', metadataRouter);
}
