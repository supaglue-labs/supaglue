import { useActiveApplication } from '@/context/activeApplication';
import { useApplications } from '@/hooks/useApplications';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import * as React from 'react';

export default function ApplicationMenu() {
  const { applications = [], isLoading, error } = useApplications();
  const { activeApplication, setActiveApplication } = useActiveApplication();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onChangeApplication = (applicationId: string) => {
    handleClose();

    const foundApplication = applications.find(({ id }) => id === applicationId);
    if (!foundApplication) {
      // TODO: error?
      return;
    }

    setActiveApplication(foundApplication);
  };

  return (
    <>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        fullWidth
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          textAlign: 'start',
          px: 3,
          color: '#fff',
          borderRadius: 0,
        }}
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        <Box>
          <Typography sx={{ fontSize: 12 }}>Application</Typography>
          <Typography sx={{ fontSize: 20, lineHeight: 1 }}>{activeApplication.name}</Typography>
        </Box>
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {/* TODO: Implement loading state */}
        {applications.map(({ id, name }) => (
          <MenuItem key={id} onClick={() => onChangeApplication(id)} selected={id === activeApplication.id}>
            {name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
