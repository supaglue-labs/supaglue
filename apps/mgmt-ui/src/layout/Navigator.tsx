/* eslint-disable @typescript-eslint/no-floating-promises */
import ApplicationMenu from '@/components/ApplicationMenu';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import type { SupaglueProps } from '@/pages/applications/[applicationId]';
import { Biotech, FindInPage, MenuBook } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import HubIcon from '@mui/icons-material/Hub';
import PeopleIcon from '@mui/icons-material/People';
import SchemaIcon from '@mui/icons-material/Schema';
import SettingsIcon from '@mui/icons-material/Settings';
import SyncIcon from '@mui/icons-material/Sync';

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

export default function Navigator(props: DrawerProps & SupaglueProps) {
  const { lekko, ...other } = props;

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
          id: 'Connectors',
          to: `/applications/${applicationId}/connectors/providers`,
          icon: <HubIcon />,
          active: false,
        },

        {
          id: 'Syncs',
          to: `/applications/${applicationId}/syncs/syncs`,
          icon: <SyncIcon />,
          active: false,
        },
        {
          id: 'Data Model',
          to: `/applications/${applicationId}/data_model/entities`,
          icon: <SchemaIcon />,
          active: false,
        },
        {
          id: 'Logs',
          to: `/applications/${applicationId}/logs`,
          icon: <FindInPage />,
          active: false,
        },
        {
          id: 'Settings',
          to: `/applications/${applicationId}/settings/webhooks`,
          icon: <SettingsIcon />,
          active: false,
        },
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

  if (
    !lekko.schemasWhitelistConfig.applicationIds.includes(applicationId) &&
    !lekko.entitiesWhitelistConfig.applicationIds.includes(applicationId)
  ) {
    categories[0].children = categories[0].children.filter((category) => category.id !== 'Data Model');
  }

  return (
    <Drawer variant="permanent" {...other}>
      <List disablePadding>
        <ListItem sx={{ px: 0, pb: 1, fontSize: 22, color: '#fff' }}>
          <ApplicationMenu />
        </ListItem>
        {categories.map(({ id, children }) => (
          <Box key={id} sx={{ bgcolor: '#101F33', py: 2 }}>
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
