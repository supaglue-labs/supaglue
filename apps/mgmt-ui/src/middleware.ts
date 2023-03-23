import { getAuth, withClerkMiddleware } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { IS_CLOUD } from './pages/api';

// Set the paths that don't require the user to be signed in
const publicPaths = ['/sign-in*', '/sign-up*'];

const createOrgPath = '/create-organization*';

const cloudPaths = ['/sign-in*/', '/sign-up*', '/create-organization*'];

const isCloudPublicPath = (path: string) => {
  return publicPaths.find((x) => path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))));
};

const isCloudCreateOrgPath = (path: string) => path.match(new RegExp(`^${createOrgPath}$`.replace('*$', '($|/)')));

const isCloudPath = (path: string) => {
  return cloudPaths.find((x) => path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))));
};

export default withClerkMiddleware((request: NextRequest) => {
  if (!IS_CLOUD) {
    if (isCloudPath(request.nextUrl.pathname)) {
      const selfHostedSignInUrl = new URL('/api/auth/signin', request.url);
      return NextResponse.redirect(selfHostedSignInUrl);
    }
    return NextResponse.next();
  }

  if (isCloudPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  // if the user is not signed in redirect them to the sign in page.
  const { userId, orgId } = getAuth(request);

  if (!userId) {
    // redirect the users to /pages/sign-in/[[...index]].ts

    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }
  if (!orgId && !isCloudCreateOrgPath(request.nextUrl.pathname)) {
    // redirect users to create org

    const createOrgUrl = new URL('/create-organization', request.url);
    createOrgUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(createOrgUrl);
  }
  return NextResponse.next();
});

export const config = { matcher: '/((?!_next/image|_next/static|favicon.ico).*)' };
