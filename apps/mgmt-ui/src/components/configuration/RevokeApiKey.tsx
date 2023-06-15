import { useNotification } from '@/context/notification';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useState } from 'react';

export type RevokeApiKeyProps = {
  disabled: boolean;
  onDelete: () => void;
};

export function RevokeApiKey({ disabled, onDelete }: RevokeApiKeyProps) {
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
        Revoke
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
              addNotification({ message: 'Successfully revoked API key', severity: 'success' });
              handleClose();
            }}
          >
            Revoke
          </Button>
          <Button variant="contained" onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
