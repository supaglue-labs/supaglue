import { Router } from 'express';

export default function init(app: Router): void {
  const router = Router();
  app.use('/associations', router);
}
