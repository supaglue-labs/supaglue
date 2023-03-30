import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { type GetServerSideProps } from 'next';
import { getServerSession, Session } from 'next-auth';
import { API_HOST, ORGANIZATION_ID, SG_INTERNAL_TOKEN } from './api';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  let session: Session | null = null;

  const orgId = ORGANIZATION_ID;

  session = await getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }

  // This is the same call as in apps/mgmt-ui/src/pages/api/internal/applications/index.ts
  // Get applications to set active application
  const result = await fetch(`${API_HOST}/internal/v1/applications`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-sg-internal-token': SG_INTERNAL_TOKEN,
      'x-org-id': orgId,
    },
  });

  if (!result.ok) {
    throw new Error('Errored while fetching applications');
  }

  const applications = await result.json();

  if (applications.length) {
    // Pick one application at random
    // TODO: Make it not random
    return {
      redirect: {
        destination: `/applications/${applications[0].id}`,
        permanent: false,
      },
    };
  }

  const createResult = await fetch(`${API_HOST}/internal/v1/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-sg-internal-token': SG_INTERNAL_TOKEN,
      'x-org-id': orgId,
    },
    body: JSON.stringify({
      name: 'My Application',
    }),
  });
  if (!createResult.ok) {
    throw new Error('Errored while creating application');
  }
  const application = await createResult.json();
  return {
    redirect: {
      destination: `/applications/${application.id}`,
      permanent: false,
    },
  };
};

export default function Home() {
  return null;
}
