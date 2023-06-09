import { useNotification } from '@/context/notification';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { useState } from 'react';

export type DeleteCustomerProps = {
  disabled: boolean;
  customerId: string;
  onDelete: () => void;
};

export function DeleteCustomer({ disabled, customerId, onDelete }: DeleteCustomerProps) {
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
      <IconButton className="p-1" onClick={handleClickOpen} size="small" disabled={disabled}>
        <DeleteIcon />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete customer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete customer{' '}
            <Typography fontWeight="bold" display="inline">
              {customerId}
            </Typography>
            ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button
            variant="text"
            color="error"
            onClick={() => {
              onDelete();
              addNotification({ message: 'Successfully removed customer', severity: 'success' });
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
