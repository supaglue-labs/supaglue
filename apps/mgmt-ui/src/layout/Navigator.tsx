/* eslint-disable @typescript-eslint/no-floating-promises */
import { BarChart, Biotech, FindInPage, MenuBook, Tune } from '@mui/icons-material';
import PeopleIcon from '@mui/icons-material/People';
import {
  Box,
  Divider,
  Drawer,
  DrawerProps,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useRouter } from 'next/router';
import NavigatorMenu from './NavigatorMenu';

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
    id: 'internal',
    children: [
      {
        id: 'Dashboard',
        to: '/',
        icon: <BarChart />,
        active: false,
      },
      {
        id: 'Configuration',
        to: '/configuration/installed',
        icon: <Tune />,
        active: false,
      },
      {
        id: 'Customers',
        to: '/customers',
        icon: <PeopleIcon />,
        active: false,
      },
      {
        id: 'Sync Logs',
        to: '/sync_logs',
        icon: <FindInPage />,
        active: false,
      },
    ],
  },
  {
    id: 'external',
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
  const router = useRouter();

  return (
    <Drawer variant="permanent" {...other}>
      <List disablePadding>
        <ListItem sx={{ ...item, ...itemCategory, fontSize: 22, color: '#fff' }}>Supaglue</ListItem>
        <ListItem sx={{ ...itemCategory }}>
          <NavigatorMenu />
        </ListItem>
        {categories.map(({ id, children }) => (
          <Box key={id} sx={{ bgcolor: '#111013' }}>
            <Divider sx={{ mb: 2 }} />
            {children.map(({ id: childId, icon, active, to }) => (
              <ListItem disablePadding key={childId}>
                <ListItemButton
                  selected={active}
                  sx={item}
                  onClick={() => {
                    router.push(to);
                  }}
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText>{childId}</ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
