import { Connection } from '@supaglue/core/types';

declare global {
  declare namespace Express {
    // Inject additional properties on express.Request
    // See: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
    interface Request {
      customerConnection: Connection;
      sg: Record<string, string>;
    }
  }
}
