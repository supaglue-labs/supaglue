import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useState } from 'react';

export type NewCustomerProps = {
  onCreate: (customerId: string, name: string, email: string) => void;
};

export function NewCustomer({ onCreate }: NewCustomerProps) {
  const [customerId, setCustomerId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCustomerId('');
  };

  return (
    <>
      <Button variant="outlined" color="primary" className="p-1" onClick={handleClickOpen} size="small">
        Add
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>New Customer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="customerId"
            label="Customer ID"
            type="text"
            fullWidth
            value={customerId}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              setCustomerId(e.target.value);
            }}
            variant="standard"
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            value={name}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              setName(e.target.value);
            }}
            variant="standard"
          />
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email"
            type="text"
            fullWidth
            value={email}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            variant="standard"
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => {
              onCreate(customerId, name, email);
              handleClose();
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
