import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getAuth } from '@clerk/nextjs/server';
import { type GetServerSideProps } from 'next';
import { getServerSession, Session } from 'next-auth';
import { API_HOST, IS_CLOUD, SG_INTERNAL_TOKEN } from './api';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  let session: Session | null = null;

  if (!IS_CLOUD) {
    session = await getServerSession(req, res, authOptions);

    if (!session) {
      return {
        redirect: {
          destination: '/api/auth/signin',
          permanent: false,
        },
      };
    }
  } else {
    const user = getAuth(req);

    if (!user.userId || !user.orgId) {
      return {
        props: { session, signedIn: false },
      };
    }
    // TODO: Get org from user and use that to fetch application
  }

  // This is the same call as in apps/mgmt-ui/src/pages/api/internal/applications/index.ts
  // Get applications to set active application
  const result = await fetch(`${API_HOST}/internal/v1/applications`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-sg-internal-token': SG_INTERNAL_TOKEN,
    },
  });

  if (!result.ok) {
    throw new Error('Errored while fetching applications');
  }

  const applications = await result.json();

  // Pick one application at random
  // TODO: Make it not random
  if (!applications.length) {
    throw new Error('No applications found');
  }

  return {
    redirect: {
      destination: `/applications/${applications[0].id}`,
      permanent: false,
    },
  };
};

export default function Home() {
  return null;
}
