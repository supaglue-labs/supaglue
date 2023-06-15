import { useNotification } from '@/context/notification';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useState } from 'react';

export type DeleteApiKeyProps = {
  disabled: boolean;
  onDelete: () => void;
};

export function DeleteApiKey({ disabled, onDelete }: DeleteApiKeyProps) {
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
      <Button variant="text" color="error" onClick={handleClickOpen} size="small" disabled={disabled}>
        Delete
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Revoke API Key</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to revoke this API key?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', padding: '16px 24px' }}>
          <Button
            variant="text"
            color="error"
            onClick={() => {
              onDelete();
              addNotification({ message: 'Successfully removed API key', severity: 'success' });
              handleClose();
            }}
          >
            Delete
          </Button>
          <Button variant="contained" onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
