import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { type GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { API_HOST, SG_INTERNAL_TOKEN } from './api';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

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
