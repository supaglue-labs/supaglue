import { getAuth, withClerkMiddleware } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { IS_CLOUD } from './pages/api';

// Set the paths that don't require the user to be signed in
const cloudPublicPaths = ['/sign-in*', '/sign-up*'];

const cloudCreateOrgPath = '/create-organization*';

// Paths that are only accessible if `IS_CLOUD` is true
const cloudOnlyPaths = ['/sign-in*/', '/sign-up*', '/create-organization*'];

const isCloudPublicPath = (path: string) => {
  return cloudPublicPaths.find((x) => path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))));
};

const isCloudCreateOrgPath = (path: string) => path.match(new RegExp(`^${cloudCreateOrgPath}$`.replace('*$', '($|/)')));

const isCloudOnlyPath = (path: string) => {
  return cloudOnlyPaths.find((x) => path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))));
};

export default withClerkMiddleware((request: NextRequest) => {
  if (!IS_CLOUD) {
    // If it's self-hosted but user tries to access a cloud-only path, redirect them to non-cloud sign-in.
    if (isCloudOnlyPath(request.nextUrl.pathname)) {
      const selfHostedSignInUrl = new URL('/api/auth/signin', request.url);
      return NextResponse.redirect(selfHostedSignInUrl);
    }
    return NextResponse.next();
  }

  if (isCloudPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const { userId, orgId } = getAuth(request);

  // if the user is not signed in redirect them to the sign in page.
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // if the user is signed in but does not have an org, redirect them to create an org.
  if (!orgId && !isCloudCreateOrgPath(request.nextUrl.pathname)) {
    const createOrgUrl = new URL('/create-organization', request.url);
    createOrgUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(createOrgUrl);
  }
  return NextResponse.next();
});

export const config = { matcher: '/((?!_next/image|_next/static|favicon.ico).*)' };
