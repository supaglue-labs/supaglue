import type { MailboxV2, SnakecasedKeysMailboxV2 } from '@supaglue/types/engagement';

export const toSnakecasedKeysMailboxV2 = (mailbox: MailboxV2): SnakecasedKeysMailboxV2 => {
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
