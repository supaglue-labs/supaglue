import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import { useState } from 'react';
import { DeleteConfirmationModal } from '../modals';

export type DeleteConnectionProps = {
  customerId: string;
  providerName: string;
  onDelete: () => void;
};

export function DeleteConnection({ customerId, providerName, onDelete }: DeleteConnectionProps) {
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
      <DeleteConfirmationModal
        open={open}
        handleClose={handleClose}
        title="Delete connection"
        resourceName={`${customerId}'s ${providerName}`}
        onDelete={onDelete}
      />
    </>
  );
}
