/* eslint-disable @typescript-eslint/no-floating-promises */
import { Button, Card, CardContent, CardHeader, Divider, Grid, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useRouter } from 'next/router';
import { Integration, IntegrationCardInfo } from './VerticalTabs';

export default function IntegrationCard(props: { integration: Integration; integrationInfo: IntegrationCardInfo }) {
  const router = useRouter();

  const { icon, name, description, category, status, providerName } = props.integrationInfo;

  return (
    <Card
      classes={{
        root: 'h-48 justify-between flex flex-col overflow-y-hidden',
      }}
    >
      <Box>
        <CardHeader
          avatar={icon}
          subheader={
            <Stack direction="column">
              <Typography>{name}</Typography>
              <Typography fontSize={12}>{category.toUpperCase()}</Typography>
            </Stack>
          }
        />
        <CardContent
          classes={{
            root: 'text-sm h-[5rem] text-ellipsis overflow-hidden',
          }}
        >
          {description}
        </CardContent>
      </Box>
      <Box>
        <Divider />
        <Grid container justifyContent="flex-end">
          <Button
            variant="text"
            onClick={() => {
              router.push(`/configuration/${category}/${providerName}`);
            }}
          >
            View
          </Button>
        </Grid>
      </Box>
    </Card>
  );
}
