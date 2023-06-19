import { Card, CardHeader, Stack } from '@mui/material';
import classNames from 'classnames';
import { overrideTailwindClasses } from 'tailwind-override';

type MetricCardProps = {
  icon: React.ReactNode;
  value: React.ReactNode;
  className?: string;
};

export default function MetricCard(props: MetricCardProps) {
  const { value, icon, className } = props;

  return (
    <Card variant="outlined" className={overrideTailwindClasses(classNames('h-18', className))}>
      <Stack>
        <CardHeader avatar={icon} title={value} titleTypographyProps={{ variant: 'h6' }} />
      </Stack>
    </Card>
  );
}
