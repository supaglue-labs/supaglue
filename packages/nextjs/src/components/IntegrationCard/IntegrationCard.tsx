/** @jsxImportSource @emotion/react */
import classNames from 'classnames';
import { ReactNode } from 'react';
import { SalesforceConnectButton, SalesforceDisconnectButton } from '../../elements';
import { useDeveloperConfig, useIntegration } from '../../hooks/api';
import { Card } from '../../primitives';
import { SupaglueProviderInternal, useSupaglueContext } from '../../providers';
import { SupaglueAppearance } from '../../types';
import styles from './styles';

export type IntegrationCardProps = {
  name: string;
  type: string;
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
  type,
  icon: UserIcon = null,
  description,
  configurationUrl,
  appearance,
}: IntegrationCardProps) => {
  const { customerId } = useSupaglueContext();
  const { data: developerConfig } = useDeveloperConfig();
  const { data: integration, error } = useIntegration(customerId, type);
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
      <div
        style={{
          boxSizing: 'inherit',
          position: 'relative',
          transformOrigin: 'left bottom',
          transform: 'rotate(-90deg) translateX(-10rem)',
          borderRadius: '0.5em 0.5em 0px 0px',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05);',
          left: '-25px',
          top: '-105%',
          bottom: 'unset',
          padding: '0.375rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '0.5rem',
          backgroundColor: 'hsl(226, 70.0%, 55.5%)',
        }}
      >
        <p
          style={{
            fontSize: '0.625rem',
            letterSpacing: '0px',
            lineHeight: 1,
            fontWeight: 400,
            margin: '0px',
            color: 'white',
          }}
        >
          Powered by Supaglue
        </p>
      </div>
    </Card>
  );
};

export const IntegrationCard = (props: IntegrationCardProps) => (
  <SupaglueProviderInternal>
    <IntegrationCardInternal {...props} />
  </SupaglueProviderInternal>
);
