import { PrismaClient } from '@supaglue/db';
import { CommonModelType } from '@supaglue/types';

export const getRemoteId = async (prisma: PrismaClient, id: string, commonModel: CommonModelType): Promise<string> => {
  let record = null;
  switch (commonModel) {
    case 'account': {
      record = await prisma.crmAccount.findUnique({ where: { id } });
      break;
    }
    case 'contact': {
      record = await prisma.crmContact.findUnique({ where: { id } });
      break;
    }
    case 'lead': {
      record = await prisma.crmLead.findUnique({ where: { id } });
      break;
    }
    case 'opportunity': {
      record = await prisma.crmOpportunity.findUnique({ where: { id } });
      break;
    }
    case 'user': {
      record = await prisma.crmUser.findUnique({ where: { id } });
      break;
    }
  }
  if (!record) {
    throw new Error(`Record ${id} not found for common model ${commonModel}`);
  }
  return record.remoteId;
};
