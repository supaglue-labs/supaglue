import { FieldMapping, TriggerSyncButton, useSupaglueContext } from '@supaglue/nextjs';
import { useDeveloperConfig, useSalesforceIntegration } from '@supaglue/nextjs/src/hooks/api';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { PageTabs } from '../../components/PageTabs';
import { useActiveTab } from '../../hooks';
// TUTORIAL: Uncomment this
// import { Switch } from '@supaglue/nextjs';

export default function Integration() {
  return (
    <>
      <Head>
        <title>Supaglue</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="px-6 xl:pr-2 pb-16">
        <IntegrationPage />
      </main>
    </>
  );
}

const IntegrationPage = () => {
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
      router.push('/integrations');
    }
  }, [router, integration, isLoading, error]);

  return (
    <>
      <header>
        <h1 className="text-4xl font-bold my-6">Salesforce Integration</h1>
      </header>
      {integrationConnected && developerConfig && <SyncConfiguration />}
    </>
  );
};

const pageTabs = ['Contacts', 'Leads', 'Accounts', 'Opportunities'];

const SyncConfiguration = () => {
  const syncConfigName = useActiveTab(pageTabs[0]);

  const [timeoutId, setTimeoutId] = useState<number | undefined>();
  const [toastMessage, setToastMessage] = useState<string | undefined>();

  const showToast = (message: string) => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    setToastMessage(message);
    setTimeoutId(
      window.setTimeout(() => {
        setTimeoutId(undefined);
      }, 2000)
    );
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSwitch = (syncConfigName: string) => {
    // TUTORIAL: uncomment this
    // return (
    //   <div className="px-3">
    //     <div className="py-2">
    //       <Switch syncConfigName={syncConfigName} />
    //     </div>
    //     <p className="text-sm text-gray-600">Fully refresh all updated contacts every 15 minutes.</p>
    //   </div>
    // );
    return null;
  };

  return (
    <>
      <PageTabs className="" tabs={pageTabs} disabled={false} />
      <>
        <div className="flex flex-col gap-4">
          <div className="relative pt-3 px-3">
            <TriggerSyncButton
              syncConfigName={syncConfigName}
              onSuccess={() => showToast('Successfully started sync!')}
              onError={() => showToast('Error encountered.')}
            />
            {timeoutId && (
              <span className="absolute z-10 top-0 left-36 mt-5 block rounded bg-gray-600 py-1 px-2 text-xs text-white">
                {toastMessage}
              </span>
            )}
          </div>

          <div>{getSwitch(syncConfigName)}</div>

          <div className="flex flex-col gap-4">
            <FieldMapping syncConfigName={syncConfigName} key={syncConfigName} />
          </div>
        </div>
      </>
    </>
  );
};
