/** @jsxImportSource @emotion/react */
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { HTMLAttributes } from 'react';
import { SupaglueApiProvider, useSalesforceIntegration } from '../../hooks/api';
import { SgCacheProvider, useSupaglueContext } from '../../provider';
import { SupaglueAppearance } from '../../types';
import { Button } from '../Button';
import styles from '../Button/styles';

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
      css={[styles.button, { width: '8rem' }]}
      className={classNames('sg-salesforceConnectButton', props.appearance?.elements?.button)}
      onClick={onClick}
    >
      {integrationConnected ? 'Configure' : 'Connect'}
    </Button>
  );
};

export const SalesforceConnectButton = (props: SalesforceConnectButtonProps) => (
  <SupaglueApiProvider>
    <SgCacheProvider>
      <SalesforceConnectButtonInternal {...props} />
    </SgCacheProvider>
  </SupaglueApiProvider>
);
