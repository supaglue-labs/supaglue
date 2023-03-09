import { Avatar, Card, CardContent, Grid, Typography } from '@mui/material';
import { ReactNode } from 'react';

export type CustomerCardProps = {
  email: string;
  company: string;
  metric: string;
  id: string;
  icon: ReactNode;
  provider: string;
};

export default function CustomerCard(props: CustomerCardProps) {
  const { email, company, metric, id, icon } = props;

  return (
    <Card>
      <CardContent classes={{ root: 'py-6' }}>
        <Grid container>
          <Grid container item xs={5}>
            <Grid item className="mx-2">
              <Avatar alt="Developer 1">{email.charAt(0).toUpperCase()}</Avatar>
            </Grid>
            <Grid item>
              <Typography fontSize={12}>{email}</Typography>
              <Typography fontSize={12}>{company}</Typography>
            </Grid>
          </Grid>
          <Grid item xs={5}>
            <Typography fontSize={12}>{metric}</Typography>
            <Typography fontSize={12}>ID: {id}</Typography>
          </Grid>
          {/*<Grid item xs={2} container justifyContent="end" alignItems="center">
            {icon}
            <ArrowForwardIos />
          </Grid>*/}
        </Grid>
      </CardContent>
    </Card>
  );
}
