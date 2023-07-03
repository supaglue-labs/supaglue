import { DeleteResourceConfirmationModal } from '@/components/modals';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import { useState } from 'react';

export type DeleteSchemaProps = {
  schemaId: string;
  onDelete: () => void;
};

export function DeleteSchema({ schemaId, onDelete }: DeleteSchemaProps) {
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
      <DeleteResourceConfirmationModal
        open={open}
        handleClose={handleClose}
        onDelete={onDelete}
        title="Delete Schema"
        resourceName={`Schema ${schemaId}`}
      />
    </>
  );
}
