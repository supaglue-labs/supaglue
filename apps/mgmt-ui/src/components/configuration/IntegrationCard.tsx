/* eslint-disable @typescript-eslint/no-floating-promises */
import { sendRequest } from '@/sendRequests';
import { Button, Card, CardContent, CardHeader, Divider, Grid, Switch } from '@mui/material';
import { Box } from '@mui/system';
import { useRouter } from 'next/router';
import useSWRMutation from 'swr/mutation';
import { Integration, IntegrationCardInfo } from './VerticalTabs';

export default function IntegrationCard(props: {
  integration: Integration;
  integrationInfo: IntegrationCardInfo;
  enabled: boolean;
}) {
  const router = useRouter();
  const { trigger } = useSWRMutation('/mgmt/v1/integrations', sendRequest);
  const { enabled, integration } = props;
  const { icon, name, description, category, providerName } = props.integrationInfo;
  return (
    <Card
      classes={{
        root: 'h-48 justify-between flex flex-col overflow-y-hidden',
      }}
    >
      <Box>
        <CardHeader
          avatar={icon}
          subheader={name}
          action={
            <Switch
              checked={enabled}
              onClick={() => {
                trigger({ ...integration, enabled: !enabled });
              }}
            ></Switch>
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
