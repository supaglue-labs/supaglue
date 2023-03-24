import Navigator from '@/layout/Navigator';
import '@/styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Box, CssBaseline, StyledEngineProvider, ThemeProvider, useMediaQuery } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { ReactNode, useState } from 'react';
import { IS_CLOUD } from './api';

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
  if (!IS_CLOUD) {
    if (!signedIn) {
      return null;
    }
    return (
      <SessionProvider session={session}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <InnerApp signedIn={signedIn}>
              <Component {...pageProps} />
            </InnerApp>
          </ThemeProvider>
        </StyledEngineProvider>
      </SessionProvider>
    );
  }

  return (
    <ClerkProvider {...pageProps}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <InnerApp signedIn={signedIn}>
            <Component {...pageProps} />
          </InnerApp>
        </ThemeProvider>
      </StyledEngineProvider>
    </ClerkProvider>
  );
}

function InnerApp({ signedIn, children }: { signedIn: boolean; children: ReactNode }) {
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
            />
          )}
          <Navigator PaperProps={{ style: { width: drawerWidth } }} sx={{ display: { sm: 'block', xs: 'none' } }} />
        </Box>
      )}
      {children}
    </Box>
  );
}
