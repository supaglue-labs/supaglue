import type { Application as SupaglueApplication, ConnectionSafeAny } from '@supaglue/types';

declare global {
  declare namespace Express {
    // Inject additional properties on express.Request
    // See: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
    interface Request {
      customerId: string;
      supaglueApplication: SupaglueApplication;
      customerConnection: ConnectionSafeAny;
      orgId: string;
      sg: Record<string, string>;
    }
  }
}
