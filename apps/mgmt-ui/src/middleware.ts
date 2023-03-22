import { getAuth, withClerkMiddleware } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { IS_CLOUD } from './pages/api';

// Set the paths that don't require the user to be signed in
const publicPaths = ['/sign-in*', '/sign-up*'];

const isPublic = (path: string) => {
  return publicPaths.find((x) => path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))));
};

export default withClerkMiddleware((request: NextRequest) => {
  if (!IS_CLOUD) {
    return NextResponse.next();
  }

  if (isPublic(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  // if the user is not signed in redirect them to the sign in page.
  const { userId } = getAuth(request);

  if (!userId) {
    // redirect the users to /pages/sign-in/[[...index]].ts

    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
});

export const config = { matcher: '/((?!_next/image|_next/static|favicon.ico).*)' };
