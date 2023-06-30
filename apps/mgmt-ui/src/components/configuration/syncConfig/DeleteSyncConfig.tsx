import { DeleteConfirmationModal } from '@/components/modals';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import { useState } from 'react';

export type DeleteSyncConfigProps = {
  syncConfigId: string;
  onDelete: () => void;
};

export function DeleteSyncConfig({ syncConfigId, onDelete }: DeleteSyncConfigProps) {
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
        onDelete={onDelete}
        title="Delete Sync Config"
        resourceName={`Sync Config ${syncConfigId}`}
      />
    </>
  );
}
