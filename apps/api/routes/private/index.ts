import { Router } from 'express';
import v2 from './v2';

export default function init(app: Router): void {
  const privateRouter = Router();

  v2(privateRouter);

  app.use('/private', privateRouter);
}
