import { DeleteResourceConfirmationModal } from '@/components/modals';
import { Button } from '@mui/material';
import { useState } from 'react';

export type DeleteProviderButtonProps = {
  providerName: string;
  onDelete: () => void;
};

export function DeleteProviderButton({ providerName, onDelete }: DeleteProviderButtonProps) {
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
      <DeleteResourceConfirmationModal
        open={open}
        handleClose={handleClose}
        onDelete={onDelete}
        resourceName={`provider for ${providerName}`}
        title="Delete Provider"
      />
    </>
  );
}
