import { DeleteResourceConfirmationModal } from '@/components/modals';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import { useState } from 'react';

/**
 * @deprecated
 */
export type DeleteSchemaProps = {
  name: string;
  onDelete: () => void;
};

/**
 * @deprecated
 */
export function DeleteSchema({ name, onDelete }: DeleteSchemaProps) {
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
        resourceName={`Schema ${name}`}
      />
    </>
  );
}
