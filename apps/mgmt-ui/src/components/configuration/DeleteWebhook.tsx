import { useNotification } from '@/context/notification';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useState } from 'react';

export type DeleteWebhookProps = {
  disabled: boolean;
  onDelete: () => void;
};

export function DeleteWebhook({ disabled, onDelete }: DeleteWebhookProps) {
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
        <DialogTitle>Delete webhook</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this webhook?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', padding: '16px 24px' }}>
          <Button
            variant="text"
            color="error"
            onClick={() => {
              onDelete();
              addNotification({ message: 'Successfully deleted webhook', severity: 'success' });
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
