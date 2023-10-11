import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { Svix } from 'svix';
import { AppPortal } from 'svix-react';

import 'svix-react/style.css';
import Spinner from '../Spinner';

export default function WebhookTabPanel({
  applicationId,
  svixApiToken,
}: {
  applicationId: string;
  svixApiToken?: string;
}) {
  const [svixDashboardUrl, setSvixDashboardUrl] = useState<string | null>(null);

  useEffect(() => {
    const getDashboardUrl = async () => {
      if (svixApiToken) {
        const svix = new Svix(svixApiToken, {
          serverUrl: process.env.NEXT_PUBLIC_SVIX_SERVER_URL,
        });
        const dashboardUrl = (await svix.authentication.appPortalAccess(applicationId, {})).url;
        setSvixDashboardUrl(dashboardUrl);
      }
    };

    void getDashboardUrl();
  }, [applicationId]);

  if (!svixDashboardUrl) {
    return <Spinner />;
  }

  return (
    <Box
      sx={{
        padding: 6,
        flexGrow: 1,
        bgcolor: 'background.paper',
        display: 'flex',
        height: 'full',
        borderRadius: '0',
      }}
      component={AppPortal}
      url={svixDashboardUrl}
      fullSize
    ></Box>
  );
}
