import { authMiddleware } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { IS_CLOUD } from './pages/api';

// Set the paths that don't require the user to be signed in
const cloudPublicPaths = ['/sign-in*', '/sign-up*', '/links*', '/api/internal/links*', '/api/internal/env*'];

// Paths that are only accessible if `IS_CLOUD` is true
const cloudOnlyPaths = ['/sign-in*/', '/sign-up*', '/create-organization*', '/switch-organization*'];

const isCloudPublicPath = (path: string) => {
  return cloudPublicPaths.find((x) => path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))));
};

const isCloudOnlyPath = (path: string) => {
  return cloudOnlyPaths.find((x) => path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))));
};

const cloudMiddleware = authMiddleware({
  afterAuth(auth, request) {
    if (isCloudPublicPath(request.nextUrl.pathname)) {
      return NextResponse.next();
    }

    const { userId, orgId } = auth;

    // if the user is not signed in redirect them to the sign in page.
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', process.env.FRONTEND_URL ?? request.url);
      return NextResponse.redirect(signInUrl);
    }

    // redirect them to create an organization if they don't have one
    if (userId && !orgId && !request.nextUrl.pathname.startsWith('/create-organization')) {
      const createOrganizationUrl = new URL('/create-organization?switcher=1', request.url);
      return NextResponse.redirect(createOrganizationUrl);
    }

    return NextResponse.next();
  },
});

const nonCloudMiddleware = async (request: NextRequest) => {
  // If it's self-hosted but user tries to access a cloud-only path, redirect them to non-cloud sign-in.
  if (isCloudOnlyPath(request.nextUrl.pathname)) {
    const selfHostedSignInUrl = new URL('/api/auth/signin', request.url);
    return NextResponse.redirect(selfHostedSignInUrl);
  }
  return NextResponse.next();
};

export default IS_CLOUD ? cloudMiddleware : nonCloudMiddleware;

export const config = { matcher: '/((?!_next/image|_next/static|favicon.ico|api/health|ingest).*)' };
