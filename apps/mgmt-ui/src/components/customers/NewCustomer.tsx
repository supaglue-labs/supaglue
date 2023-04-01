import AddIcon from '@mui/icons-material/Add';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material';
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
      <IconButton className="p-1" onClick={handleClickOpen} size="small">
        <AddIcon />
      </IconButton>
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
        <DialogActions>
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
