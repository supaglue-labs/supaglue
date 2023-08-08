/* eslint-disable @typescript-eslint/no-floating-promises */
import ApplicationMenu from '@/components/ApplicationMenu';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useNextLambdaEnv } from '@/hooks/useNextLambdaEnv';
import { Biotech, FindInPage, MenuBook, Tune } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PeopleIcon from '@mui/icons-material/People';
import type { DrawerProps } from '@mui/material';
import {
  Box,
  Divider,
  Drawer,
  Link as MUILink,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import NextLink from 'next/link';

type Category = {
  id: string;
  to: string;
  icon: React.ReactNode;
  active: boolean;
};

const item = {
  py: '2px',
  px: 3,
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover, &:focus': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
  },
};

export default function Navigator(props: DrawerProps) {
  const { ...other } = props;

  const { nextLambdaEnv } = useNextLambdaEnv();
  const applicationId = useActiveApplicationId();

  const categories: {
    id: string;
    children: Category[];
  }[] = [
    {
      id: 'Manage',
      children: [
        {
          id: 'Getting Started',
          to: `/applications/${applicationId}`,
          icon: <HomeIcon />,
          active: false,
        },
        {
          id: 'Customers',
          to: `/applications/${applicationId}/customers`,
          icon: <PeopleIcon />,
          active: false,
        },
        {
          id: 'Configuration',
          to: `/applications/${applicationId}/configuration/providers`,
          icon: <Tune />,
          active: false,
        },
        {
          id: 'Syncs',
          to: `/applications/${applicationId}/syncs`,
          icon: <FindInPage />,
          active: false,
        },
        {
          id: 'Sync Runs',
          to: `/applications/${applicationId}/sync_runs`,
          icon: <FindInPage />,
          active: false,
        },
        ...(nextLambdaEnv?.IS_CLOUD
          ? [
              {
                id: 'Team Settings',
                to: nextLambdaEnv.CLERK_ORGANIZATION_URL,
                icon: <ManageAccountsIcon />,
                active: false,
              },
            ]
          : []),
      ],
    },
    {
      id: 'Learn',
      children: [
        {
          id: 'API Explorer',
          to: 'https://docs.supaglue.com/api/introduction',
          icon: <Biotech />,
          active: false,
        },
        {
          id: 'Documentation',
          to: 'https://docs.supaglue.com',
          icon: <MenuBook />,
          active: false,
        },
      ],
    },
  ];

  return (
    <Drawer variant="permanent" {...other}>
      <List disablePadding>
        <ListItem sx={{ p: 0, fontSize: 22, color: '#fff' }}>
          <ApplicationMenu />
        </ListItem>
        {categories.map(({ id, children }) => (
          <Box key={id} sx={{ bgcolor: '#101F33' }}>
            <ListItem sx={{ py: 2, px: 3 }}>
              <ListItemText sx={{ color: '#fff' }}>{id}</ListItemText>
            </ListItem>
            {children.map(({ id: childId, icon, active, to }) => (
              <ListItem disablePadding key={childId}>
                <MUILink href={to} component={NextLink} sx={{ width: '100%', textDecoration: 'none' }}>
                  <ListItemButton selected={active} sx={item}>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText>{childId}</ListItemText>
                  </ListItemButton>
                </MUILink>
              </ListItem>
            ))}
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
