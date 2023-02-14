import { SyncConfigCard, useSupaglueContext } from '@supaglue/nextjs';
import { useDeveloperConfig, useSalesforceIntegration } from '@supaglue/nextjs/src/hooks/api';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { DrawerMenuButton } from '../../components/DrawerMenuButton';
import { PageTabs } from '../../components/PageTabs';
import { useActiveTab } from '../../hooks';

export default function Integration() {
  const router = useRouter();
  const type = router.query.type as string;
  const typeCaps = type ? type.charAt(0).toUpperCase() + type.slice(1) : '';
  return (
    <>
      <Head>
        <title>Apolla.io - Integrations - {typeCaps}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="px-6 xl:pr-2 pb-16">
        <IntegrationPage type={typeCaps} />
      </main>
    </>
  );
}

const IntegrationPage = ({ type }: { type: string }) => {
  const router = useRouter();
  const { customerId } = useSupaglueContext();
  const { data: integration, isLoading, error } = useSalesforceIntegration(customerId);
  const { data: developerConfig } = useDeveloperConfig();
  const integrationConnected = integration && error?.response?.status !== 404;

  useEffect(() => {
    if (isLoading || error) {
      // TODO: There is an issue here currently:
      // initially the customerId is `anonymousCustomerId`, which results in a 404. Later, it becomes `user1`.
      // Therefore, we don't want to redirect the user from this page immediately for now.
      return;
    }

    if (!integration) {
      void router.push('/integrations');
    }
  }, [router, integration, isLoading, error]);

  return (
    <>
      <header className="flex items-center gap-4">
        <DrawerMenuButton />
        <h1 className="text-4xl font-bold my-6">{type} Integration</h1>
      </header>
      {integrationConnected && developerConfig && <SyncConfiguration />}
    </>
  );
};

const pageTabs = ['Contacts', 'Leads', 'Accounts', 'Opportunities'];

const SyncConfiguration = () => {
  const syncConfigName = useActiveTab(pageTabs[0]);

  return (
    <>
      <PageTabs className="" tabs={pageTabs} disabled={false} />
      <div className="flex pt-4">
        <SyncConfigCard syncConfigName={syncConfigName} />
      </div>
    </>
  );
};
