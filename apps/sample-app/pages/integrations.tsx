import { IntegrationCard } from '@supaglue/nextjs';
import Head from 'next/head';
import { DrawerMenuButton } from '../components/DrawerMenuButton';

export default function Integrations() {
  return (
    <>
      <Head>
        <title>Apolla.io - Integrations</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="px-6 xl:pr-2 pb-16">
        <IntegrationsPage />
      </main>
    </>
  );
}

const IntegrationsPage = () => {
  // TODO: more elegant way of getting the redirect url (needs to work for salesforce callback)
  const location = typeof window !== 'undefined' ? window.location.toString() : undefined;

  return (
    <>
      <header className="flex items-center gap-4">
        <DrawerMenuButton />
        <h1 className="text-4xl font-bold my-6">Integrations</h1>
      </header>
      <ul className="flex list-none">
        <IntegrationCard
          name="Salesforce"
          description="Sync your Objects"
          configurationUrl={`${location}/salesforce`}
        />
      </ul>
    </>
  );
};
