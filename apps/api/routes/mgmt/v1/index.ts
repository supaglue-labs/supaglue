import { Router } from 'express';
import customer from './customer';
import integration from './integration';

export default function init(app: Router): void {
  const v1Router = Router();

  customer(v1Router);
  integration(v1Router);

  app.use('/v1', v1Router);
}
