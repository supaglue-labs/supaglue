/* eslint-disable @typescript-eslint/no-floating-promises */
import ApplicationMenu from '@/components/ApplicationMenu';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { Biotech, FindInPage, MenuBook, Tune } from '@mui/icons-material';
import PeopleIcon from '@mui/icons-material/People';
import {
  Box,
  Divider,
  Drawer,
  DrawerProps,
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

  const applicationId = useActiveApplicationId();

  const categories: {
    id: string;
    children: Category[];
  }[] = [
    {
      id: 'Manage',
      children: [
        {
          id: 'Customers',
          to: `/applications/${applicationId}`,
          icon: <PeopleIcon />,
          active: false,
        },
        {
          id: 'Configuration',
          to: `/applications/${applicationId}/configuration/integrations/crm`,
          icon: <Tune />,
          active: false,
        },
        {
          id: 'Sync Logs',
          to: `/applications/${applicationId}/sync_logs`,
          icon: <FindInPage />,
          active: false,
        },
      ],
    },
    {
      id: 'Learn',
      children: [
        {
          id: 'API Explorer',
          to: 'https://docs.supaglue.com/api',
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
