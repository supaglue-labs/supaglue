import { useNotification } from '@/context/notification';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { useState } from 'react';

export type DeleteSyncConfigProps = {
  syncConfigId: string;
  onDelete: () => void;
};

export function DeleteSyncConfig({ syncConfigId, onDelete }: DeleteSyncConfigProps) {
  const { addNotification } = useNotification();
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton className="p-1" onClick={handleClickOpen} size="small">
        <DeleteIcon />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Sync Config</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <Typography fontWeight="bold" display="inline">
              Sync Config {syncConfigId}
            </Typography>
            ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', padding: '16px 24px' }}>
          <Button
            variant="text"
            color="error"
            onClick={() => {
              onDelete();
              addNotification({ message: 'Successfully removed Sync Config', severity: 'success' });
              handleClose();
            }}
          >
            Delete
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
