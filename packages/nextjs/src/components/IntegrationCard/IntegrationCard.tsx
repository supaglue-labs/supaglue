/** @jsxImportSource @emotion/react */
import classNames from 'classnames';
import { useDeveloperConfig } from '../../hooks/api';
import { SupaglueInternalProvider } from '../../providers';
import { SupaglueAppearance } from '../../types';
import { SalesforceConnectButton } from '../SalesforceConnectButton';
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
  const { data: developerConfig } = useDeveloperConfig();

  return developerConfig ? (
    <li>
      <div css={styles.card} className={classNames(appearance?.elements?.card, 'sg-integrationCard')}>
        <span css={styles.name} className={classNames(appearance?.elements?.name, 'sg-integrationCard-name')}>
          {name}
        </span>
        <span
          css={styles.description}
          className={classNames(appearance?.elements?.description, 'sg-integrationCard-description')}
        >
          {description}
        </span>
        <SalesforceConnectButton configurationUrl={configurationUrl} appearance={appearance} />
      </div>
    </li>
  ) : (
    <span>No developer config found</span>
  );
};

export const IntegrationCard = (props: IntegrationCardProps) => (
  <SupaglueInternalProvider>
    <IntegrationCardInternal {...props} />
  </SupaglueInternalProvider>
);
