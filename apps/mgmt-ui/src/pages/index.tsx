import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getAuth } from '@clerk/nextjs/server';
import { type GetServerSideProps } from 'next';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { API_HOST, IS_CLOUD, ORGANIZATION_ID, SG_INTERNAL_TOKEN } from './api';

export const getServerSideProps: GetServerSideProps = async ({ req, res, resolvedUrl }) => {
  let session: Session | null = null;

  let orgId = ORGANIZATION_ID;

  session = await getServerSession(req, res, authOptions);

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
    if (!user.userId) {
      return {
        redirect: {
          destination: '/sign-in?redirect_url=' + resolvedUrl,
          permanent: false,
        },
      };
    }
    if (!user.orgId) {
      return {
        redirect: {
          destination: '/create-organization',
          permanent: false,
        },
      };
    }
    ({ orgId } = user);
  }

  // This is the same call as in apps/mgmt-ui/src/pages/api/internal/applications/index.ts
  // Get applications to set active application
  const result = await fetch(`${API_HOST}/internal/applications`, {
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

  const createResult = await fetch(`${API_HOST}/internal/applications`, {
    method: 'PUT',
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
