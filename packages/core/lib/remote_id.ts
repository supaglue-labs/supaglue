import prisma from '@supaglue/db';
import { CommonModel } from '@supaglue/types';

export const getRemoteId = async (id: string, commonModel: CommonModel): Promise<string> => {
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
    case 'event': {
      record = await prisma.crmEvent.findUnique({ where: { id } });
      break;
    }
  }
  if (!record) {
    throw new Error(`Record ${id} not found for common model ${commonModel}`);
  }
  return record.remoteId;
};
