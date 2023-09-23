import { DeleteResourceConfirmationModal } from '@/components/modals';
import { Button } from '@mui/material';
import { useState } from 'react';

/**
 * @deprecated
 */
export type DeleteSchemaButtonProps = {
  schemaName: string;
  onDelete: () => void;
};

/**
 * @deprecated
 */
export function DeleteSchemaButton({ schemaName, onDelete }: DeleteSchemaButtonProps) {
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
        resourceName={schemaName}
        title="Delete Schema"
      />
    </>
  );
}
