import type { SupaglueProps } from '@/pages/applications/[applicationId]';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GroupIcon from '@mui/icons-material/Group';
import { Link as MUILink, ListItemIcon, MenuItem } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import NextLink from 'next/link';
import * as React from 'react';
import { Logout } from '../Logout';

function Profile(props: SupaglueProps) {
  const { CLERK_ACCOUNT_URL } = props;

  return (
    <MUILink href={CLERK_ACCOUNT_URL} component={NextLink} sx={{ color: 'inherit', textDecoration: 'inherit' }}>
      <MenuItem>
        <ListItemIcon>
          <AccountCircleIcon />
        </ListItemIcon>
        Profile
      </MenuItem>
    </MUILink>
  );
}

function Organization(props: SupaglueProps) {
  const { CLERK_ORGANIZATION_URL } = props;

  return (
    <MUILink href={CLERK_ORGANIZATION_URL} component={NextLink} sx={{ color: 'inherit', textDecoration: 'inherit' }}>
      <MenuItem>
        <ListItemIcon>
          <GroupIcon />
        </ListItemIcon>
        Organization
      </MenuItem>
    </MUILink>
  );
}

export default function AccountMenu(props: SupaglueProps) {
  const { IS_CLOUD } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = async () => {
    setAnchorEl(null);
  };
  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }}></Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {IS_CLOUD ? <Profile {...props} /> : null}
        {IS_CLOUD ? <Organization {...props} /> : null}
        <Logout />
      </Menu>
    </React.Fragment>
  );
}
