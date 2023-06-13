import { useNotification } from '@/context/notification';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { useState } from 'react';

export type DeleteConnectionProps = {
  customerId: string;
  providerName: string;
  onDelete: () => void;
};

export function DeleteConnection({ customerId, providerName, onDelete }: DeleteConnectionProps) {
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
      <IconButton className="p-1" onClick={handleClickOpen} size="small">
        <DeleteIcon />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete connection</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <Typography fontWeight="bold" display="inline">
              {customerId}'s {providerName}
            </Typography>{' '}
            connection?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button
            variant="text"
            color="error"
            onClick={() => {
              onDelete();
              addNotification({ message: 'Successfully removed connection', severity: 'success' });
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
