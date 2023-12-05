import { Stack, Switch, Typography } from '@mui/material';

type SwitchWithLabelProps = {
  label: string;
  isLoading: boolean;
  disabled?: boolean;
  checked: boolean;
  onToggle: (checked: boolean) => void;
};

export function SwitchWithLabel({ label, isLoading, disabled, checked, onToggle }: SwitchWithLabelProps) {
  return (
    <Stack direction="row" className="gap-2 items-center">
      <Switch disabled={isLoading || disabled} checked={checked} onChange={(_, checked) => onToggle(checked)} />
      <Typography>{label}</Typography>
    </Stack>
  );
}
