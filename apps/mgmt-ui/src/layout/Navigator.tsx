/* eslint-disable @typescript-eslint/no-floating-promises */
import { Biotech, MenuBook, Tune } from '@mui/icons-material';
import PeopleIcon from '@mui/icons-material/People';
import {
  Box,
  Divider,
  Drawer,
  DrawerProps,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

type Category = {
  id: string;
  to: string;
  icon: React.ReactNode;
  active: boolean;
};

const categories: {
  id: string;
  children: Category[];
}[] = [
  {
    id: 'Manage',
    children: [
      // {
      //   id: 'Dashboard',
      //   to: '/',
      //   icon: <BarChart />,
      //   active: false,
      // },
      {
        id: 'Customers',
        to: '/customers',
        icon: <PeopleIcon />,
        active: false,
      },
      {
        id: 'Configuration',
        to: '/configuration/integrations/crm',
        icon: <Tune />,
        active: false,
      },
      // {
      //   id: 'Sync Logs',
      //   to: '/sync_logs',
      //   icon: <FindInPage />,
      //   active: false,
      // },
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

const item = {
  py: '2px',
  px: 3,
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover, &:focus': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
  },
};

const itemCategory = {
  boxShadow: '0 -1px 0 rgb(255,255,255,0.1) inset',
  py: 1.5,
  px: 3,
};

export default function Navigator(props: DrawerProps) {
  const { ...other } = props;

  return (
    <Drawer variant="permanent" {...other}>
      <List disablePadding>
        <ListItem sx={{ ...item, ...itemCategory, fontSize: 22, color: '#fff' }}>Supaglue</ListItem>

        {categories.map(({ id, children }) => (
          <Box key={id} sx={{ bgcolor: '#101F33' }}>
            <ListItem sx={{ py: 2, px: 3 }}>
              <ListItemText sx={{ color: '#fff' }}>{id}</ListItemText>
            </ListItem>
            {children.map(({ id: childId, icon, active, to }) => (
              <ListItem disablePadding key={childId}>
                <Link href={to} sx={{ width: '100%', 'text-decoration': 'none' }}>
                  <ListItemButton selected={active} sx={item}>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText>{childId}</ListItemText>
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
