import PostgresIcon from '@/assets/destination_icons/postgres.png';
import SupaglueIcon from '@/assets/supaglue.png';
import { TabPanel } from '@/components/TabPanel';
import { useDestinations } from '@/hooks/useDestinations';
import Image from 'next/image';
import { useRouter } from 'next/router';
import * as React from 'react';
import DestinationDetailsPanel from './DestinationDetailsPanel';
import DestinationsListPanel from './DestinationsTabPanel';

const ICON_SIZE = 35;

export type DestinationCardInfo = {
  icon?: React.ReactNode;
  name: string;
  type: 'postgres' | 'supaglue';
  description: string;
};

export const postgresDestinationCardInfo: DestinationCardInfo = {
  icon: <Image alt="postgres" src={PostgresIcon} width={ICON_SIZE} height={ICON_SIZE} />,
  name: 'Postgres',
  type: 'postgres',
  description: 'Configure your Postgres destination.',
};

export const supaglueDestinationCardInfo: DestinationCardInfo = {
  icon: <Image alt="supaglue" src={SupaglueIcon} width={ICON_SIZE} height={ICON_SIZE} />,
  name: 'Supaglue',
  type: 'supaglue',
  description: 'Use the Supaglue Managed destination and query for your data using the Supaglue Data API.',
};

export const destinationCardsInfo: DestinationCardInfo[] = [postgresDestinationCardInfo, supaglueDestinationCardInfo];

export default function DestinationTabPanelContainer() {
  const router = useRouter();
  const { tab = [] } = router.query;
  const [, type] = Array.isArray(tab) ? tab : [tab];
  const { destinations: existingDestinations = [], isLoading } = useDestinations();

  const isListPage = tab.length === 1;
  const isDetailPage = tab.length === 2;

  return (
    <TabPanel value={0} index={0} className="w-full">
      {isListPage && (
        <DestinationsListPanel
          isLoading={isLoading}
          destinationCardsInfo={destinationCardsInfo}
          existingDestinations={existingDestinations}
        />
      )}
      {isDetailPage && <DestinationDetailsPanel isLoading={isLoading} type={type as 'postgres'} />}
    </TabPanel>
  );
}
