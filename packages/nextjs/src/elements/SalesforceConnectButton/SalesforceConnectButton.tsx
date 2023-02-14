/** @jsxImportSource @emotion/react */
import { useRouter } from 'next/router';
import { HTMLAttributes } from 'react';
import { useSalesforceIntegration } from '../../hooks/api';
import { Button } from '../../primitives/Button';
import { SupaglueProviderInternal } from '../../providers';
import { useSupaglueContext } from '../../providers/SupaglueProvider';
import { SupaglueAppearance } from '../../types';

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
      void router.push(configurationUrl);
    } else {
      window.location.href = `${apiUrl}/oauth/salesforce?${queryParams.toString()}`;
    }
  };

  if (children) {
    return <>{children}</>;
  }

  return (
    <Button className="sg-salesforceConnectButton" appearance={props.appearance} onClick={onClick}>
      {integrationConnected ? 'Configure' : 'Connect'}
    </Button>
  );
};

export const SalesforceConnectButton = (props: SalesforceConnectButtonProps) => (
  <SupaglueProviderInternal>
    <SalesforceConnectButtonInternal {...props} />
  </SupaglueProviderInternal>
);
