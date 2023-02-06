/** @jsxImportSource @emotion/react */
import axios from 'axios';
import classNames from 'classnames';
import { HTMLAttributes, useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { SupaglueProviderInternal, useSupaglueContext } from '../../providers';
import { SupaglueAppearance } from '../../types';
import { Button } from '../Button';
import styles from '../Button/styles';

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
      css={[styles.destructiveButton]}
      className={classNames('sg-salesforceDisconnectButton', props.appearance?.elements?.button)}
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
