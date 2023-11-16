import { DeleteResourceConfirmationModal } from '@/components/modals';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Typography } from '@mui/material';
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
      <DeleteResourceConfirmationModal
        open={open}
        handleClose={handleClose}
        onDelete={onDelete}
        title="Delete Sync Config"
        resourceName={`Sync Config ${syncConfigId}`}
        contentOverride={
          <Typography>
            Are you sure you want to delete{' '}
            <Typography fontWeight="bold" display="inline">
              {`Sync Config ${syncConfigId}`}
            </Typography>
            ? This will delete syncs for all existing customers that use this Sync Config.
          </Typography>
        }
      />
    </>
  );
}
