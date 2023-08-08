import { CreateOrganization, OrganizationSwitcher } from '@clerk/nextjs';
import { Paper, Typography } from '@mui/material';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: { session: null, signedIn: false },
  };
};

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { switcher } = router.query;
  return (
    <div className="m-auto">
      {switcher === '1' ? (
        <div className="flex flex-col items-center gap-6">
          <Paper className="px-8 py-10 gap-6 flex flex-col" elevation={1}>
            <Typography variant="h5">Switch organization</Typography>
            <OrganizationSwitcher afterSwitchOrganizationUrl="/" hidePersonal={true} />
          </Paper>
          <div className="text-sm">
            or <a href="/create-organization">create organization</a>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <CreateOrganization afterCreateOrganizationUrl="/" />
          <div className="text-sm">
            or <a href="/create-organization?switcher=1">switch organization</a>
          </div>
        </div>
      )}
    </div>
  );
}
