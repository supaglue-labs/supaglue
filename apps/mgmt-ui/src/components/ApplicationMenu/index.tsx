import { addApplication, deleteApplication, updateApplicationName } from '@/client';
import { useActiveApplication } from '@/hooks/useActiveApplication';
import { useApplications } from '@/hooks/useApplications';
import { MoreVert } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, Divider, IconButton, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { Stack } from '@mui/system';
import { Application } from '@supaglue/types';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

export default function ApplicationMenu() {
  const router = useRouter();
  const { applications = [], mutate } = useApplications();
  const { activeApplication, isLoading, mutate: mutateActiveApplication } = useActiveApplication();

  // Top-level menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onAddApplication = async (name: string) => {
    handleClose();
    const newApplication = await addApplication(name);
    await mutate([...applications, newApplication]);
    await router.push(`/applications/${newApplication.id}`);
  };

  const onUpdateApplicationName = async (id: string, name: string) => {
    handleClose();
    const newApplication = await updateApplicationName(id, name);
    await mutate(applications.map((application) => (application.id === id ? newApplication : application)));
    if (id === activeApplication?.id) {
      await mutateActiveApplication(newApplication);
    }
  };

  const onDeleteApplication = async (id: string) => {
    handleClose();
    await deleteApplication(id);
    await mutate(applications.filter((application) => application.id !== id));
    if (activeApplication?.id === id) {
      await router.replace('/');
    }
  };

  return (
    <Stack direction="column" textAlign="center" sx={{ width: '100%' }}>
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
          <Typography sx={{ fontSize: 20, lineHeight: 1 }}>
            {isLoading ? 'Loading...' : activeApplication?.name}
          </Typography>
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
        {applications.map((application) => (
          <Application
            key={application.id}
            application={application}
            onUpdateApplicationName={onUpdateApplicationName}
            onDeleteApplication={onDeleteApplication}
          />
        ))}
        <Divider />
        <NewApplication onCreate={onAddApplication} />
      </Menu>
    </Stack>
  );
}

function Application({
  application,
  onUpdateApplicationName,
  onDeleteApplication,
}: {
  application: Application;
  onUpdateApplicationName: (id: string, name: string) => void;
  onDeleteApplication: (id: string) => void;
}) {
  const { id, name } = application;

  // Nested menu
  const [nestedAnchorEl, setNestedAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleNestedMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // don't click the parent button
    event.preventDefault();
    setNestedAnchorEl(event.currentTarget);
  };
  const handleNestedMenuClose = () => {
    setNestedAnchorEl(null);
  };

  return (
    <>
      <MenuItem component={NextLink} href={`/applications/${id}`} sx={{ paddingRight: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Typography>{name}</Typography>
          <IconButton onClick={handleNestedMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>
      </MenuItem>
      <Menu
        anchorEl={nestedAnchorEl}
        open={Boolean(nestedAnchorEl)}
        onClose={handleNestedMenuClose}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
      >
        <UpdateApplicationMenuItem application={application} onUpdateApplicationName={onUpdateApplicationName} />
        <DeleteApplicationMenuItem application={application} onDeleteApplication={onDeleteApplication} />
      </Menu>
    </>
  );
}

function UpdateApplicationMenuItem({
  application,
  onUpdateApplicationName,
}: {
  application: Application;
  onUpdateApplicationName: (id: string, name: string) => void;
}) {
  const [applicationName, setApplicationName] = React.useState('');

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setApplicationName('');
  };

  return (
    <>
      <MenuItem onClick={handleClickOpen}>Update</MenuItem>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Application Name</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            Enter a new name for{' '}
            <Typography display="inline" sx={{ fontWeight: 'bold' }}>
              {application.name}
            </Typography>
            .
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="applicationName"
            label="Name"
            type="text"
            fullWidth
            value={applicationName}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
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
              onUpdateApplicationName(application.id, applicationName);
              // TODO: error state
              handleClose();
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function DeleteApplicationMenuItem({
  application,
  onDeleteApplication,
}: {
  application: Application;
  onDeleteApplication: (id: string) => void;
}) {
  const [applicationName, setApplicationName] = React.useState('');

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setApplicationName('');
  };

  return (
    <>
      <MenuItem onClick={handleClickOpen}>Delete</MenuItem>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Application</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            You are about to delete application{' '}
            <Typography display="inline" sx={{ fontWeight: 'bold' }}>
              {application.name}
            </Typography>
            . Type{' '}
            <Typography display="inline" sx={{ fontWeight: 'bold' }}>
              {application.name}
            </Typography>{' '}
            below to confirm deletion.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="applicationName"
            label="Name"
            type="text"
            fullWidth
            value={applicationName}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              setApplicationName(e.target.value);
            }}
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            disabled={application.name !== applicationName}
            onClick={() => {
              onDeleteApplication(application.id);
              // TODO: error state
              handleClose();
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
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
    setApplicationName('');
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
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
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
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
