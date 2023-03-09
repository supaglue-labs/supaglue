import { Grid } from '@mui/material';
import IntegrationCard from './IntegrationCard';
import { Integration, IntegrationCardInfo } from './VerticalTabs';

export type IntegrationTabPanelProps = {
  integrationCardsInfo: IntegrationCardInfo[];
  activeIntegrations: Integration[];
  status: string;
};

export default function IntegrationTabPanel(props: IntegrationTabPanelProps) {
  const { integrationCardsInfo, activeIntegrations, status } = props;

  return (
    <Grid container spacing={2}>
      {integrationCardsInfo
        .filter((info) => info.status === status)
        .map((info) => {
          const activeIntegration = activeIntegrations.find(
            (integration: Integration) => info.providerName === integration.providerName
          );

          return (
            <Grid key={info.name} item xs={6}>
              <IntegrationCard
                enabled={Boolean(activeIntegration)}
                integration={activeIntegration}
                integrationInfo={info}
              />
            </Grid>
          );
        })}
    </Grid>
  );
}
