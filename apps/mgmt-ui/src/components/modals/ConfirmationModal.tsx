import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

export type ConfirmationModalProps = {
  title: string;
  content: React.ReactNode;
  open: boolean;
  cancelText?: string;
  confirmText?: string;
  cancelVariant?: 'text' | 'contained' | 'outlined';
  cancelColor?: 'error' | 'inherit' | 'primary' | 'secondary' | 'success' | 'info' | 'warning';
  confirmVariant?: 'text' | 'contained' | 'outlined';
  confirmColor?: 'error' | 'inherit' | 'primary' | 'secondary' | 'success' | 'info' | 'warning';
  handleClose: () => void;
  onConfirm: () => void;
};

export function ConfirmationModal({
  title,
  content,
  confirmText,
  cancelText,
  cancelVariant,
  cancelColor,
  confirmVariant,
  confirmColor,
  onConfirm,
  handleClose,
  open,
}: ConfirmationModalProps) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', padding: '16px 24px' }}>
        <Button variant={cancelVariant} color={cancelColor} onClick={handleClose}>
          {cancelText ?? 'Cancel'}
        </Button>
        <Button
          variant={confirmVariant}
          color={confirmColor}
          onClick={() => {
            onConfirm();
            handleClose();
          }}
        >
          {confirmText ?? 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
