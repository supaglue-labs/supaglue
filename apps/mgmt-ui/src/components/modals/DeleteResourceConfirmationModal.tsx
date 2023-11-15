import { Typography } from '@mui/material';
import { ConfirmationModal } from './ConfirmationModal';

export type DeleteResourceConfirmationModalProps = {
  title: string;
  resourceName: string;
  open: boolean;
  handleClose: () => void;
  onDelete: () => void;
  contentOverride?: React.ReactNode;
};

export function DeleteResourceConfirmationModal({
  title,
  resourceName,
  onDelete,
  handleClose,
  open,
  contentOverride,
}: DeleteResourceConfirmationModalProps) {
  return (
    <ConfirmationModal
      open={open}
      handleClose={handleClose}
      onConfirm={onDelete}
      confirmText="Delete"
      cancelVariant="text"
      confirmVariant="contained"
      confirmColor="error"
      title={title}
      content={
        contentOverride ?? (
          <Typography>
            Are you sure you want to delete{' '}
            <Typography fontWeight="bold" display="inline">
              {resourceName}
            </Typography>
            ?
          </Typography>
        )
      }
    />
  );
}
