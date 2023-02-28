import { CrmRemoteClient } from '../remotes/crm/base';
import { ConnectionService } from '../services/connection_service';

export const refreshAccessTokenIfNecessary = async (
  connectionId: string,
  client: CrmRemoteClient,
  connectionService: ConnectionService
) => {
  const connection = await connectionService.getById(connectionId);
  // This is only necessary for hubspot.
  if (connection.providerName !== 'hubspot') {
    return;
  }

  const { expiresAt } = connection.credentials;

  // TODO: Move refresh logic into the HubSpotClient class
  if (!expiresAt || Date.parse(expiresAt) < Date.now() + 300000) {
    const token = await client.refreshAccessToken();
    await connectionService.updateConnection(connection.id, {
      credentials: {
        type: 'oauth2',
        raw: token,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        expiresAt: new Date(Date.now() + token.expiresIn * 1000).toISOString(),
        instanceUrl: '',
      },
    });
  }
};
