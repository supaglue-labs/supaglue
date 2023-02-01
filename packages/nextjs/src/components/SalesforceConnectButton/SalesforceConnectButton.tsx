import classNames from 'classnames';
import { useRouter } from 'next/router';
import { HTMLAttributes } from 'react';
import { SupaglueApiProviderInternal, useSalesforceIntegration } from '../../hooks/api';
import { useSupaglueContext } from '../../provider';
import { SupaglueAppearance } from '../../types';
import styles from './SalesforceConnectButton.module.css';

export type SalesforceConnectButtonProps = {
  configurationUrl: string;
  appearance?: SupaglueAppearance & {
    elements?: {
      buttonLabel?: string;
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
    <button
      className={classNames('sg-buttonLabel', props.appearance?.elements?.buttonLabel, styles.button)}
      onClick={onClick}
      type="button"
    >
      {integrationConnected ? 'Configure' : 'Connect'}
    </button>
  );
};

export const SalesforceConnectButton = (props: SalesforceConnectButtonProps) => (
  <SupaglueApiProviderInternal>
    <SalesforceConnectButtonInternal {...props} />
  </SupaglueApiProviderInternal>
);
