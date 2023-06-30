import { Button } from '@mui/material';
import { useState } from 'react';
import { DeleteResourceConfirmationModal } from '../modals';

export type DeleteWebhookProps = {
  disabled: boolean;
  onDelete: () => void;
};

export function DeleteWebhook({ disabled, onDelete }: DeleteWebhookProps) {
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

      <DeleteResourceConfirmationModal
        open={open}
        handleClose={handleClose}
        onDelete={onDelete}
        title="Delete webhook"
        resourceName="this webhook"
      />
    </>
  );
}
