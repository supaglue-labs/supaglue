import { ConnectionSafe } from '@supaglue/core/types';

declare global {
  declare namespace Express {
    // Inject additional properties on express.Request
    // See: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
    interface Request {
      supaglueApplication: Application;
      customerConnection: ConnectionSafe;
      sg: Record<string, string>;
    }
  }
}
