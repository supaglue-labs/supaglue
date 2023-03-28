import { addApplication } from '@/client';
import { useActiveApplication } from '@/hooks/useActiveApplication';
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
import { Stack } from '@mui/system';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

export default function ApplicationMenu() {
  const router = useRouter();
  const { applications = [], mutate } = useApplications();
  const { activeApplication, isLoading } = useActiveApplication();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onAddApplication = async (name: string) => {
    const newApplication = await addApplication(name);
    await mutate([...applications, newApplication]);
    await router.push(`/applications/${newApplication.id}`);
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
        {applications.map(({ id, name }) => (
          <MenuItem key={id}>
            <Link
              style={{
                textDecoration: 'none',
                color: '#000',
              }}
              href={`/applications/${id}`}
            >
              {name}
            </Link>
          </MenuItem>
        ))}
        <Divider />
        <NewApplication onCreate={onAddApplication} />
      </Menu>
    </Stack>
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
