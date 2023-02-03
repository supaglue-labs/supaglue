import '../styles/globals.css';

import { ArrowTopRightOnSquareIcon, BookOpenIcon, HomeIcon, UsersIcon } from '@heroicons/react/24/outline';
import { SupaglueProvider } from '@supaglue/nextjs';
// TUTORIAL: Uncomment this
// import { darkTheme } from '@supaglue/nextjs/src/style/themes';
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { DrawerHeader } from '../components/DrawerHeader';
import { useCustomerIdFromSession } from '../hooks';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <AppWrapper>
        <Component {...pageProps} />
      </AppWrapper>
    </SessionProvider>
  );
}

function AppWrapper({ children }: { children: React.ReactNode }) {
  const { pathname } = useRouter();

  const customerId = useCustomerIdFromSession();

  const navigation = [
    { name: 'App Objects', href: '/', icon: UsersIcon, current: pathname === '/' },
    { name: 'Integrations', href: '/integrations', icon: HomeIcon, current: pathname === '/integrations' },
    {
      name: 'Documentation',
      href: 'https://supaglue-docs.vercel.app',
      icon: BookOpenIcon,
      target: '_blank',
    },
  ];

  return (
    <SupaglueProvider
      apiUrl={process.env.NEXT_PUBLIC_API_SERVER_URL ?? 'http://localhost:8080'}
      customerId={customerId}
      // TUTORIAL: Uncomment this
      // theme={darkTheme}
    >
      <SWRConfig
        value={{
          fetcher: (resource, init) => fetch(resource, init).then((res) => res.json()),
        }}
      >
        {/* Drawer */}
        <div className="drawer drawer-mobile">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content bg-base-100">{children}</div>
          <div className="drawer-side">
            <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
            <aside className="flex flex-col bg-base-200 w-80">
              <DrawerHeader name="Apolla" />
              <div className="flex flex-1 flex-col justify-between">
                <ul className="mt-4 menu p-4 w-80 text-base-content">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} target={item.target}>
                        <span className="inline-flex gap-6">
                          <item.icon className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                          <span className="inline-flex gap-2 items-center">
                            {item.name}
                            {item.target && (
                              <>
                                <ArrowTopRightOnSquareIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                <span className="sr-only">(opens in a new tab)</span>
                              </>
                            )}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <UserProfile desktop />
              </div>
            </aside>
          </div>
        </div>
      </SWRConfig>
    </SupaglueProvider>
  );
}

function UserProfile({ desktop }: { desktop?: boolean }) {
  const { data: session } = useSession();
  return (
    <div className="flex flex-shrink-0 bg-base-300 p-4 h-20">
      <div className="flex items-center gap-3">
        <Avatar aria-hidden="true">MX</Avatar>
        <div>
          <p className="text-sm font-medium text-accent">
            {session?.user?.name ?? session?.user?.email ?? 'Anonymous User'}
          </p>
          {session ? (
            <button className="link link-hover text-sm" onClick={() => signOut()}>
              Sign out
            </button>
          ) : (
            <button className="link link-hover text-sm" onClick={() => signIn()}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Avatar({ children }: { children: ReactNode }) {
  return (
    <div className="avatar placeholder">
      <div className="bg-neutral-focus text-neutral-content rounded-full w-12">
        <span>{children}</span>
      </div>
    </div>
  );
}
