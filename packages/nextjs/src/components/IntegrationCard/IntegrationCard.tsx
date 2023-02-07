/** @jsxImportSource @emotion/react */
import classNames from 'classnames';
import { SalesforceConnectButton, SalesforceDisconnectButton } from '..';
import { useDeveloperConfig, useSalesforceIntegration } from '../../hooks/api';
import { SupaglueProviderInternal, useSupaglueContext } from '../../providers';
import { SupaglueAppearance } from '../../types';
import styles from './styles';

export type IntegrationCardProps = {
  name: string;
  description: string;
  /** this should have the same protocol and hostname as your app */
  configurationUrl: string;
  appearance?: SupaglueAppearance & {
    elements?: {
      card?: string;
      name?: string;
      description?: string;
      button?: string;
    };
  };
};

const IntegrationCardInternal = ({ name, description, configurationUrl, appearance }: IntegrationCardProps) => {
  const { customerId } = useSupaglueContext();
  const { data: developerConfig } = useDeveloperConfig();
  const { data: integration, error } = useSalesforceIntegration(customerId);
  const integrationConnected = integration && error?.response?.status !== 404;

  if (!developerConfig) {
    return <span>No developer config found</span>;
  }

  return (
    <li>
      <div css={styles.card} className={classNames(appearance?.elements?.card, 'sg-integrationCard')}>
        <span css={styles.cardName} className={classNames(appearance?.elements?.name, 'sg-integrationCard-name')}>
          {name}
        </span>
        <span
          css={styles.cardDescription}
          className={classNames(appearance?.elements?.description, 'sg-integrationCard-description')}
        >
          {description}
        </span>
        <div css={styles.buttonWrapper}>
          {integrationConnected ? <SalesforceDisconnectButton integration={integration} /> : null}
          <SalesforceConnectButton configurationUrl={configurationUrl} appearance={appearance} />
        </div>
      </div>
    </li>
  );
};

export const IntegrationCard = (props: IntegrationCardProps) => (
  <SupaglueProviderInternal>
    <IntegrationCardInternal {...props} />
  </SupaglueProviderInternal>
);
