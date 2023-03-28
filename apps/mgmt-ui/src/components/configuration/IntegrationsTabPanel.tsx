import { Grid } from '@mui/material';
import { Integration } from '@supaglue/core/types';
import Spinner from '../Spinner';
import IntegrationCard from './IntegrationCard';
import { IntegrationCardInfo } from './IntegrationTabPanelContainer';

export type IntegrationsListPanelProps = {
  integrationCardsInfo: IntegrationCardInfo[];
  existingIntegrations: Integration[];
  isLoading: boolean;
};

export default function IntegrationsListPanel(props: IntegrationsListPanelProps) {
  const { integrationCardsInfo, existingIntegrations, isLoading } = props;

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Grid container spacing={2}>
      {integrationCardsInfo.map((info) => {
        const existingIntegration = existingIntegrations.find(
          (integration: Integration) => info.providerName === integration.providerName
        );

        return (
          <Grid key={info.name} item xs={6}>
            <IntegrationCard integration={existingIntegration} integrationInfo={info} />
          </Grid>
        );
      })}
    </Grid>
  );
}
