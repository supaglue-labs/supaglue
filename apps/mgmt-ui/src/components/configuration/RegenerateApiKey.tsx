import { Button, Typography } from '@mui/material';
import { useState } from 'react';
import { ConfirmationModal } from '../modals';

export type RegenerateApiKeyProps = {
  disabled: boolean;
  onConfirm: () => void;
};

export function RegenerateApiKey({ disabled, onConfirm }: RegenerateApiKeyProps) {
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

      <ConfirmationModal
        open={open}
        title="Regenerate API Key"
        handleClose={handleClose}
        onConfirm={onConfirm}
        cancelVariant="contained"
        confirmVariant="text"
        content={
          <Typography>Are you sure you want to regenerate this API Key? This will revoke the existing key.</Typography>
        }
      />
    </>
  );
}
