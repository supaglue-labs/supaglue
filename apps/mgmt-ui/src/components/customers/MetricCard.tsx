import { Card, Grid, Typography } from '@mui/material';

type MetricCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
};

export default function MetricCard(props: MetricCardProps) {
  const { title, value, icon } = props;

  return (
    <Card
      classes={{
        root: 'p-4 max-h-28',
      }}
    >
      <Grid container>
        <Grid
          item
          classes={{
            root: 'flex mx-4',
          }}
          alignItems="center"
          justifyContent="center"
        >
          {icon}
        </Grid>
        <Grid
          item
          direction="column"
          classes={{
            root: 'my-4 mr-4',
          }}
        >
          <Typography variant="subtitle1" noWrap>
            {title}
          </Typography>
          <Typography variant="body2" noWrap>
            {value}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
}
