import { getDependencyContainer } from '@/dependency_container';
import { Router } from 'express';

const { prisma } = getDependencyContainer();

export default function init(app: Router) {
  const router = Router();

  router.get('/_get_connections', async (req, res) => {
    const connections = await prisma.connection.findMany({
      where: {
        provider: {
          applicationId: req.supaglueApplication.id,
        },
      },
      select: {
        id: true,
        providerName: true,
        customerId: true,
        sync: {
          select: {
            version: true,
          },
        },
      },
    });

    return res.status(200).send(
      connections.map((connection) => ({
        id: connection.id,
        provider_name: connection.providerName,
        customer_id: connection.customerId,
        sync_version: connection.sync?.version,
      }))
    );
  });

  app.use('/sync-migration', router);
}
