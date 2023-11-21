import { SupaglueHead } from '@/components/SupaglueHead';
import { NotificationManager } from '@/context/notification';
import { useActiveApplication } from '@/hooks/useActiveApplication';
import Navigator from '@/layout/Navigator';
import '@/styles/globals.css';
import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { Box, CssBaseline, StyledEngineProvider, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LicenseInfo } from '@mui/x-license-pro';
import { DateTime } from 'luxon';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import posthog from 'posthog-js';
import { PostHogProvider, usePostHog } from 'posthog-js/react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { IS_CLOUD, MUI_LICENSE_KEY } from './api';
import type { SupaglueProps } from './applications/[applicationId]';

LicenseInfo.setLicenseKey(MUI_LICENSE_KEY!);

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY!, {
    // Enable debug mode in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug();
      }
    },
    api_host: process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/ingest`
      : window.location.port === '3000'
      ? `http://${window.location.hostname}:3000/ingest`
      : `https://${window.location.hostname}/ingest`,
  });
}

const publicPages = ['/sign-in/[[...index]]', '/sign-up/[[...index]]', '/links/[linkId]'];

// Note: from material-ui template. Eventually consolidate between styled props, sx, and tailwindcss
export let theme = createTheme({
  palette: {
    primary: {
      light: '#63ccff',
      main: '#009be5',
      dark: '#006db3',
    },
  },
  typography: {
    h5: {
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: 0.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
  mixins: {
    toolbar: {
      minHeight: 48,
    },
  },
});

theme = {
  ...theme,
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#081627',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:active': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          marginLeft: theme.spacing(1),
        },
        indicator: {
          height: 3,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          backgroundColor: theme.palette.common.white,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          margin: '0 16px',
          minWidth: 0,
          padding: 0,
          [theme.breakpoints.up('md')]: {
            padding: 0,
            minWidth: 0,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: theme.spacing(1),
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 4,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgb(255,255,255,0.15)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#4fc3f7',
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: 14,
          fontWeight: theme.typography.fontWeightMedium,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: 'inherit',
          minWidth: 'auto',
          marginRight: theme.spacing(2),
          '& svg': {
            fontSize: 20,
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 32,
          height: 32,
        },
      },
    },
  },
};

const drawerWidth = 256;

export default function App({ Component, pageProps: { session, signedIn, ...pageProps } }: AppProps) {
  const router = useRouter();
  const { pathname } = useRouter();
  const isPublicPage = publicPages.includes(pathname);

  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog?.capture('$pageview');
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);

  if (!IS_CLOUD) {
    if (!signedIn && !isPublicPage) {
      return null;
    }
    return (
      <PostHogProvider client={posthog}>
        <SessionProvider session={session}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <NotificationManager>
                <InnerApp signedIn={signedIn} {...pageProps}>
                  <Component {...pageProps} />
                </InnerApp>
              </NotificationManager>
            </ThemeProvider>
          </StyledEngineProvider>
        </SessionProvider>
      </PostHogProvider>
    );
  }

  return (
    <PostHogProvider client={posthog}>
      <ClerkProvider {...pageProps}>
        <PosthogClerkUserIdentifier>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <NotificationManager>
                <InnerApp signedIn={signedIn} {...pageProps}>
                  {isPublicPage ? (
                    <Component {...pageProps} />
                  ) : (
                    <>
                      <SignedIn>
                        <Component {...pageProps} />
                      </SignedIn>
                      <SignedOut>
                        <RedirectToSignIn />
                      </SignedOut>
                    </>
                  )}
                </InnerApp>
              </NotificationManager>
            </ThemeProvider>
          </StyledEngineProvider>
        </PosthogClerkUserIdentifier>
      </ClerkProvider>
    </PostHogProvider>
  );
}

const PosthogClerkUserIdentifier = (props: { children: ReactNode }) => {
  const posthog = usePostHog();
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (user && isLoaded && isSignedIn && posthog) {
      posthog?.identify(user.id, {
        email: user.emailAddresses[0]?.emailAddress,
      });
      posthog?.group('company', user.organizationMemberships[0]?.organization.id, {
        name: user.organizationMemberships[0]?.organization.name,
        date_created: user.organizationMemberships[0]?.organization.createdAt,
      });
    }
  }, [posthog, user, isLoaded, isSignedIn]);

  return <>{props.children}</>;
};

function InnerApp(props: { signedIn: boolean; children: ReactNode } & SupaglueProps) {
  const { activeApplication } = useActiveApplication();
  const { signedIn, children } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {signedIn && activeApplication && !activeApplication.isPaid && <Banner createdAt={activeApplication.createdAt} />}
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        {/* Don't show navigator if not signed in */}
        {signedIn && (
          <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
            {isSmUp ? null : (
              <Navigator
                PaperProps={{ style: { width: drawerWidth, top: 'unset' } }}
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                {...props}
              />
            )}
            <Navigator
              PaperProps={{ style: { width: drawerWidth, top: 'unset' } }}
              sx={{ display: { sm: 'block', xs: 'none' } }}
              {...props}
            />
          </Box>
        )}
        <SupaglueHead />
        {children}
      </Box>
    </>
  );
}

function Banner(props: { createdAt: string }) {
  const { createdAt } = props;

  const createdAtDate = DateTime.fromJSDate(new Date(createdAt));
  const nowDate = DateTime.fromJSDate(new Date());

  const dateDiff = nowDate.diff(createdAtDate, ['days']).toObject();
  const daysRemaining = Math.max(0, 30 - Math.floor(dateDiff.days ?? 30));

  return (
    <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-gray-50 px-6 py-2.5 sm:px-3.5 sm:before:flex-1 z-[1300]">
      <div
        className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
        aria-hidden="true"
      >
        <div
          className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
        />
      </div>
      <div
        className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
        aria-hidden="true"
      >
        <div
          className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm leading-6 text-gray-900">
          <strong className="font-semibold">Free 30 trial</strong>
          <svg viewBox="0 0 2 2" className="mx-2 inline h-0.5 w-0.5 fill-current" aria-hidden="true">
            <circle cx={1} cy={1} r={1} />
          </svg>
          There are <span className="font-semibold">{daysRemaining}</span> days remaining in your free Supaglue trial.
        </p>
        <a
          href="mailto:support@supaglue.com"
          className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          Upgrade now<span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </div>
  );
}
