import { useAuth, useOrganizationList } from '@clerk/nextjs';
import { Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const SwitchOrganizationPage = () => {
  const { orgId } = useAuth();
  const { organizationList, setActive } = useOrganizationList();
  const { replace } = useRouter();

  useEffect(() => {
    if (orgId) {
      // eslint-disable-next-line no-console
      return void replace('/').catch(console.error);
    }

    if (setActive && organizationList) {
      if (organizationList.length === 0) {
        // eslint-disable-next-line no-console
        return void replace('/create-organization').catch(console.error);
      }
      void (async () => {
        await setActive({ organization: organizationList[0].organization });
        await replace('/');
      })();
    }
  }, [orgId, organizationList, setActive]);

  return <Typography className="m-auto">Loading...</Typography>;
};

export default SwitchOrganizationPage;
