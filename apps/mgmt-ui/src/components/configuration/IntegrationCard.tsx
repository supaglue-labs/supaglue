/* eslint-disable @typescript-eslint/no-floating-promises */
import { useIntegration } from '@/hooks/useIntegration';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Button, Card, CardContent, CardHeader, Divider, Grid, Stack, Switch, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useRouter } from 'next/router';
import { Integration, IntegrationCardInfo } from './VerticalTabs';

export default function IntegrationCard(props: { integration: Integration; integrationInfo: IntegrationCardInfo }) {
  const router = useRouter();
  const { integration } = props;
  const { integrations: existingIntegrations = [], mutate } = useIntegrations();
  const { mutate: mutateIntegration } = useIntegration(integration?.id); // TODO: run this when there's an integration only

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
              <Typography fontSize={12}>{status === 'auth-only' ? status : category.toUpperCase()}</Typography>
            </Stack>
          }
          action={
            <Switch
              disabled={true}
              checked={integration?.isEnabled}
              // onClick={() => {
              //   if (!integration) {
              //     const newIntegration = {
              //       authType: 'oauth2',
              //       category,
              //       providerName,
              //       isEnabled: true, // TODO: we need another notion of live vs enabled
              //       applicationId: APPLICATION_ID,
              //     };
              //     const updatedIntegrations = [...existingIntegrations, newIntegration];

              //     mutate(updatedIntegrations, false);
              //     mutateIntegration(createRemoteIntegration(newIntegration), false);
              //     return;
              //   }

              //   const updatedIntegration = { ...integration, isEnabled: !integration?.isEnabled };
              //   const updatedIntegrations = existingIntegrations.map((ei: Integration) =>
              //     ei.id === updatedIntegration.id ? updatedIntegration : ei
              //   );

              //   mutate(updatedIntegrations, false);
              //   mutateIntegration(updateRemoteIntegration(updatedIntegration), false);
              // }}
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
