import { Typography } from '@mui/material';
import { ConfirmationModal } from './ConfirmationModal';

export type DeleteConfirmationModalProps = {
  title: string;
  resourceName: string;
  open: boolean;
  handleClose: () => void;
  onDelete: () => void;
};

export function DeleteConfirmationModal({
  title,
  resourceName,
  onDelete,
  handleClose,
  open,
}: DeleteConfirmationModalProps) {
  return (
    <ConfirmationModal
      open={open}
      handleClose={handleClose}
      onConfirm={onDelete}
      confirmText="Delete"
      cancelVariant="contained"
      confirmVariant="text"
      confirmColor="error"
      title={title}
      content={
        <Typography>
          Are you sure you want to delete{' '}
          <Typography fontWeight="bold" display="inline">
            {resourceName}
          </Typography>
          ?
        </Typography>
      }
    />
  );
}
