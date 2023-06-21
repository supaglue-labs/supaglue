import type { Mailbox, SnakecasedKeysMailbox } from '@supaglue/types/engagement';

export const toSnakecasedKeysMailbox = (mailbox: Mailbox): SnakecasedKeysMailbox => {
  return {
    user_id: mailbox.userId,
    last_modified_at: mailbox.lastModifiedAt,
    id: mailbox.id,
    email: mailbox.email,
    created_at: mailbox.createdAt,
    updated_at: mailbox.updatedAt,
    is_deleted: mailbox.isDeleted,
    raw_data: mailbox.rawData,
  };
};
