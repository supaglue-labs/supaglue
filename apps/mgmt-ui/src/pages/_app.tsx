import { SupaglueHead } from '@/components/SupaglueHead';
import { NotificationManager } from '@/context/notification';
import Navigator from '@/layout/Navigator';
import '@/styles/globals.css';
import {
  defaultEntitiesWhitelistConfig,
  defaultSchemasWhitelistConfig,
  getEntitiesWhitelistConfig,
  getSchemasWhitelistConfig,
} from '@/utils/lekko';
import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { LekkoConfigMockProvider, LekkoConfigProvider } from '@lekko/react-sdk';
import { Box, CssBaseline, StyledEngineProvider, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LicenseInfo } from '@mui/x-license-pro';
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

  // If Lekko client API key is present, use real provider to fetch configs.
  // Otherwise, use no-op provider.
  const OptionalLekkoConfigProvider = ({ children }: { children: ReactNode }) => {
    const lekkoAPIKey = process.env.NEXT_PUBLIC_LEKKO_CLIENT_API_KEY;
    const defaultConfigs = [
      {
        config: getEntitiesWhitelistConfig(),
        result: defaultEntitiesWhitelistConfig,
      },
      {
        config: getSchemasWhitelistConfig(),
        result: defaultSchemasWhitelistConfig,
      },
    ];
    if (lekkoAPIKey) {
      return (
        <LekkoConfigProvider
          configRequests={[getEntitiesWhitelistConfig(), getSchemasWhitelistConfig()]}
          settings={{
            apiKey: process.env.NEXT_PUBLIC_LEKKO_CLIENT_API_KEY,
            repositoryName: 'dynamic-config',
            repositoryOwner: 'supaglue-labs',
          }}
          defaultConfigs={defaultConfigs}
        >
          {children}
        </LekkoConfigProvider>
      );
    }
    // If no API key is provided, use a no-op provider to not make actual calls to Lekko
    return (
      <LekkoConfigMockProvider
        settings={{ repositoryName: 'dynamic-config', repositoryOwner: 'supaglue-labs' }}
        defaultConfigs={defaultConfigs}
      >
        {children}
      </LekkoConfigMockProvider>
    );
  };

  if (!IS_CLOUD) {
    if (!signedIn && !isPublicPage) {
      return null;
    }
    return (
      <PostHogProvider client={posthog}>
        <SessionProvider session={session}>
          <OptionalLekkoConfigProvider>
            <StyledEngineProvider injectFirst>
              <ThemeProvider theme={theme}>
                <NotificationManager>
                  <InnerApp signedIn={signedIn} {...pageProps}>
                    <Component {...pageProps} />
                  </InnerApp>
                </NotificationManager>
              </ThemeProvider>
            </StyledEngineProvider>
          </OptionalLekkoConfigProvider>
        </SessionProvider>
      </PostHogProvider>
    );
  }

  return (
    <PostHogProvider client={posthog}>
      <ClerkProvider {...pageProps}>
        <PosthogClerkUserIdentifier>
          <OptionalLekkoConfigProvider>
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
          </OptionalLekkoConfigProvider>
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
  const { signedIn, children } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      {/* Don't show navigator if not signed in */}
      {signedIn && (
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
          {isSmUp ? null : (
            <Navigator
              PaperProps={{ style: { width: drawerWidth } }}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              {...props}
            />
          )}
          <Navigator
            PaperProps={{ style: { width: drawerWidth } }}
            sx={{ display: { sm: 'block', xs: 'none' } }}
            {...props}
          />
        </Box>
      )}
      <SupaglueHead />
      {children}
    </Box>
  );
}
