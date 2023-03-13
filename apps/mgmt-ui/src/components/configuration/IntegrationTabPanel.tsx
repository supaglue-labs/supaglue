import { Grid } from '@mui/material';
import IntegrationCard from './IntegrationCard';
import { Integration, IntegrationCardInfo } from './VerticalTabs';

export type IntegrationTabPanelProps = {
  integrationCardsInfo: IntegrationCardInfo[];
  existingIntegrations: Integration[];
  status: string;
};

export default function IntegrationTabPanel(props: IntegrationTabPanelProps) {
  const { integrationCardsInfo, existingIntegrations, status } = props;

  return (
    <Grid container spacing={2}>
      {integrationCardsInfo
        .filter((info) => info.status === status)
        .map((info) => {
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
