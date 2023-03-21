import { addApplication } from '@/client';
import { useActiveApplication } from '@/context/activeApplication';
import { useApplications } from '@/hooks/useApplications';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, Divider, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import * as React from 'react';

export default function ApplicationMenu() {
  const { applications = [], isLoading, error, mutate } = useApplications();
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

  const onAddApplication = async (name: string) => {
    const newApplication = await addApplication(name);
    mutate([...applications, newApplication]);
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
        <Divider />
        <NewApplication onCreate={onAddApplication} />
      </Menu>
    </>
  );
}

function NewApplication({ onCreate }: { onCreate: (name: string) => void }) {
  const [applicationName, setApplicationName] = React.useState('');

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <MenuItem onClick={handleClickOpen}>New Application</MenuItem>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>New Application</DialogTitle>
        {/* TODO: Add icon for New Application */}
        <DialogContent>
          <DialogContentText>Enter a name for the new application.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="applicationName"
            label="Name"
            type="text"
            fullWidth
            value={applicationName}
            onChange={(e) => {
              setApplicationName(e.target.value);
            }}
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => {
              onCreate(applicationName);
              // TODO: error state
              // TODO: Validate application name (e.g. empty)
              handleClose();
              setApplicationName('');
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
