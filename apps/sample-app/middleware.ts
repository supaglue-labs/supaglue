export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/_sync (sync route)
     * - _next/static (static files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/_sync|_next/static|favicon.ico).*)',
  ],
};
