import { Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';

type MetricCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
};

export default function MetricCard(props: MetricCardProps) {
  const { title, value, icon } = props;

  return (
    <Card variant="outlined" className="h-32">
      <Stack>
        <CardHeader avatar={icon} subheader={title} />
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            {value}
          </Typography>
        </CardContent>
      </Stack>
    </Card>
  );
}
