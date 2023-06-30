import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import { useState } from 'react';
import { DeleteResourceConfirmationModal } from '../modals';

export type DeleteCustomerProps = {
  disabled: boolean;
  customerId: string;
  onDelete: () => void;
};

export function DeleteCustomer({ disabled, customerId, onDelete }: DeleteCustomerProps) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton className="p-1" onClick={handleClickOpen} size="small" disabled={disabled}>
        <DeleteIcon />
      </IconButton>
      <DeleteResourceConfirmationModal
        open={open}
        handleClose={handleClose}
        onDelete={onDelete}
        title="Delete customer"
        resourceName={customerId}
      />
    </>
  );
}
