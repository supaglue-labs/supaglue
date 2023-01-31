import classNames from 'classnames';
import { SupaglueApiProvider, useDeveloperConfig } from '../../hooks/api';
import { SupaglueAppearance } from '../../types';
import { SalesforceConnectButton } from '../SalesforceConnectButton';
import styles from './IntegrationCard.module.css';

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
    };
  };
};

const IntegrationCardInternal = ({ name, description, configurationUrl, appearance }: IntegrationCardProps) => {
  const { data: developerConfig } = useDeveloperConfig();

  return developerConfig ? (
    <li>
      <div className={classNames(appearance?.elements?.card, 'sg-integrationCard', styles.card)}>
        <span className={classNames(appearance?.elements?.name, 'sg-integrationCard-name', styles.name)}>{name}</span>
        <span
          className={classNames(
            appearance?.elements?.description,
            'sg-integrationCard-description',
            styles.description
          )}
        >
          {description}
        </span>
        <SalesforceConnectButton configurationUrl={configurationUrl} />
      </div>
    </li>
  ) : (
    <span>No developer config found</span>
  );
};

export const IntegrationCard = (props: IntegrationCardProps) => (
  <SupaglueApiProvider>
    <IntegrationCardInternal {...props} />
  </SupaglueApiProvider>
);
