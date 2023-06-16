import { useNotification } from '@/context/notification';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useState } from 'react';

export type RegenerateApiKeyProps = {
  disabled: boolean;
  onConfirm: () => void;
};

export function RegenerateApiKey({ disabled, onConfirm }: RegenerateApiKeyProps) {
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
      <Button variant="contained" onClick={handleClickOpen} disabled={disabled}>
        Regenerate
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Regenerate API Key</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to regenerate this API Key? This will revoke the existing key.</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', padding: '16px 24px' }}>
          <Button
            variant="text"
            onClick={() => {
              onConfirm();
              addNotification({ message: 'Successfully regenerated API Key', severity: 'success' });
              handleClose();
            }}
          >
            Confirm
          </Button>
          <Button variant="contained" onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
