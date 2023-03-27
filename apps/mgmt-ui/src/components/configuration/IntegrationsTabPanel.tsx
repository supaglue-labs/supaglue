import { Grid } from '@mui/material';
import { Integration } from '@supaglue/core/types';
import IntegrationCard from './IntegrationCard';
import { IntegrationCardInfo } from './IntegrationTabPanelContainer';

export type IntegrationsListPanelProps = {
  integrationCardsInfo: IntegrationCardInfo[];
  existingIntegrations: Integration[];
  status: string;
};

export default function IntegrationsListPanel(props: IntegrationsListPanelProps) {
  const { integrationCardsInfo, existingIntegrations, status } = props;

  return (
    <Grid container spacing={2}>
      {integrationCardsInfo
        .filter((info) => info.status === status)
        .map((info) => {
          const existingIntegration = existingIntegrations.find(
            (integration: Integration) => info.providerName === integration.providerName
          );

          if (!existingIntegration) {
            return null;
          }

          return (
            <Grid key={info.name} item xs={6}>
              <IntegrationCard integration={existingIntegration} integrationInfo={info} />
            </Grid>
          );
        })}
    </Grid>
  );
}
