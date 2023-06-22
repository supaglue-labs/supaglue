import { useNotification } from '@/context/notification';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useState } from 'react';

export type DeleteProviderButtonProps = {
  providerName: string;
  onDelete: () => void;
};

export function DeleteProviderButton({ providerName, onDelete }: DeleteProviderButtonProps) {
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
      <Button variant="text" color="error" onClick={handleClickOpen} size="small">
        Delete
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Provider</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <Typography fontWeight="bold" display="inline">
              provider for {providerName}
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
