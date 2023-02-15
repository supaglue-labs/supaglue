/** @jsxImportSource @emotion/react */
import classNames from 'classnames';
import { ReactNode } from 'react';
import { SalesforceConnectButton, SalesforceDisconnectButton } from '../../elements';
import { useDeveloperConfig, useSalesforceIntegration } from '../../hooks/api';
import { Card } from '../../primitives';
import { SupaglueProviderInternal, useSupaglueContext } from '../../providers';
import { SupaglueAppearance } from '../../types';
import styles from './styles';

export type IntegrationCardProps = {
  name: string;
  description: string;
  icon?: ReactNode;
  /** this should have the same protocol and hostname as your app */
  configurationUrl: string;
  appearance?: SupaglueAppearance & {
    elements?: {
      card?: string;
      name?: string;
      description?: string;
      buttonWrapper?: string;
      button?: string;
      icon?: string;
    };
  };
};

const IntegrationCardInternal = ({
  name,
  icon: UserIcon = null,
  description,
  configurationUrl,
  appearance,
}: IntegrationCardProps) => {
  const { customerId } = useSupaglueContext();
  const { data: developerConfig } = useDeveloperConfig();
  const { data: integration, error } = useSalesforceIntegration(customerId);
  const integrationConnected = integration && error?.response?.status !== 404;

  if (!developerConfig) {
    return <span>No developer config found</span>;
  }

  return (
    <Card className="sg-integrationCard" appearance={appearance}>
      <span css={styles.cardIcon} className={classNames('sg-integrationCard-icon', appearance?.elements?.icon)}>
        {UserIcon}
      </span>
      <span css={styles.cardName} className={classNames('sg-integrationCard-name', appearance?.elements?.name)}>
        {name}
      </span>
      <span
        css={styles.cardDescription}
        className={classNames('sg-integrationCard-description', appearance?.elements?.description)}
      >
        {description}
      </span>
      <div
        css={styles.buttonWrapper}
        className={classNames('sg-integrationCard-buttonWrapper', appearance?.elements?.buttonWrapper)}
      >
        {integrationConnected ? <SalesforceDisconnectButton integration={integration} /> : null}
        <SalesforceConnectButton configurationUrl={configurationUrl} appearance={appearance} />
      </div>
    </Card>
  );
};

export const IntegrationCard = (props: IntegrationCardProps) => (
  <SupaglueProviderInternal>
    <IntegrationCardInternal {...props} />
  </SupaglueProviderInternal>
);
