import { Stack, Switch, Typography } from '@mui/material';

type SwitchWithLabelProps = {
  label: string;
  isLoading: boolean;
  checked: boolean;
  onToggle: (checked: boolean) => void;
};

export function SwitchWithLabel({ label, isLoading, checked, onToggle }: SwitchWithLabelProps) {
  return (
    <Stack direction="row" className="gap-2 items-center">
      <Switch disabled={isLoading} checked={checked} onChange={(_, checked) => onToggle(checked)} />
      <Typography>{label}</Typography>
    </Stack>
  );
}
