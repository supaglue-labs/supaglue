import { Card, CardHeader, Stack } from '@mui/material';

type MetricCardProps = {
  icon: React.ReactNode;
  value: React.ReactNode;
};

export default function MetricCard(props: MetricCardProps) {
  const { value, icon } = props;

  return (
    <Card variant="outlined" className="h-18">
      <Stack>
        <CardHeader avatar={icon} title={value} titleTypographyProps={{ variant: 'h6' }} />
      </Stack>
    </Card>
  );
}
