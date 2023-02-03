/** @jsxImportSource @emotion/react */
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { HTMLAttributes } from 'react';
import { useSalesforceIntegration } from '../../hooks/api';
import { SupaglueProviderInternal } from '../../providers';
import { useSupaglueContext } from '../../providers/SupaglueProvider';
import { SupaglueAppearance } from '../../types';
import { Button } from '../Button';
import styles from './styles';

export type SalesforceConnectButtonProps = {
  configurationUrl: string;
  appearance?: SupaglueAppearance & {
    elements?: {
      button?: string;
    };
  };
} & HTMLAttributes<HTMLButtonElement>;

const SalesforceConnectButtonInternal = (props: SalesforceConnectButtonProps) => {
  const { children, configurationUrl } = props;
  const { customerId, apiUrl } = useSupaglueContext();
  const { data: integration, error } = useSalesforceIntegration(customerId);
  const integrationConnected = integration && error?.response?.status !== 404;
  const router = useRouter();

  const queryParams = new URLSearchParams({
    state: JSON.stringify({ customerId, returnUrl: configurationUrl }),
  });

  const onClick = () => {
    if (integrationConnected) {
      router.push(configurationUrl);
    } else {
      window.location.href = `${apiUrl}/oauth/salesforce?${queryParams.toString()}`;
    }
  };

  if (children) {
    return <>{children}</>;
  }

  return (
    <Button
      css={styles.salesforceButton}
      className={classNames('sg-salesforceConnectButton', props.appearance?.elements?.button)}
      onClick={onClick}
    >
      {integrationConnected ? 'Configure' : 'Connect'}
    </Button>
  );
};

export const SalesforceConnectButton = (props: SalesforceConnectButtonProps) => (
  <SupaglueProviderInternal>
    <SalesforceConnectButtonInternal {...props} />
  </SupaglueProviderInternal>
);
