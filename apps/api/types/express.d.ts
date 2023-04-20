import { Application as SupaglueApplication, ConnectionSafe } from '@supaglue/types';

declare global {
  declare namespace Express {
    // Inject additional properties on express.Request
    // See: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
    interface Request {
      customerId: string;
      supaglueApplication: SupaglueApplication;
      customerConnection: ConnectionSafe;
      orgId: string;
      sg: Record<string, string>;
    }
  }
}
