/** @jsxImportSource @emotion/react */
import axios from 'axios';
import { HTMLAttributes, useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { Button } from '../../primitives/Button';
import { SupaglueProviderInternal, useSupaglueContext } from '../../providers';
import { DANGER } from '../../style/types/theme';
import { SupaglueAppearance } from '../../types';

async function deleteIntegration(url: string) {
  try {
    return await axios({ url, method: 'DELETE' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error deleting integration:', err);
  }
}

export type SalesforceDisconnectButtonProps = {
  appearance?: SupaglueAppearance & {
    elements?: {
      button?: string;
    };
  };
  integration: { id: string };
} & HTMLAttributes<HTMLButtonElement>;

const SalesforceDisconnectButtonInternal = (props: SalesforceDisconnectButtonProps) => {
  const { children, integration } = props;
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { apiUrl } = useSupaglueContext();

  const { trigger: callDeleteIntegration } = useSWRMutation(
    `${apiUrl}/integrations/${integration.id}/`,
    deleteIntegration
  );

  const onClick = async () => {
    setIsDisconnecting(true);

    // TODO: Optimistic update, since deleting Temporal schedules can take a while
    await callDeleteIntegration();

    setIsDisconnecting(false);
  };

  if (children) {
    return <>{children}</>;
  }

  return (
    <Button
      variantParams={{ colorScheme: DANGER }}
      className="sg-salesforceDisconnectButton"
      appearance={props.appearance}
      disabled={isDisconnecting}
      onClick={onClick}
    >
      Disconnect
    </Button>
  );
};

export const SalesforceDisconnectButton = (props: SalesforceDisconnectButtonProps) => (
  <SupaglueProviderInternal>
    <SalesforceDisconnectButtonInternal {...props} />
  </SupaglueProviderInternal>
);
