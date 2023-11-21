import BigQueryIcon from '@/assets/destination_icons/bigquery.png';
import PostgresIcon from '@/assets/destination_icons/postgres.png';
import RedshiftQueryIcon from '@/assets/destination_icons/redshift.png';
import SnowflakeQueryIcon from '@/assets/destination_icons/snowflake.png';
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
  type: 'postgres' | 'bigquery' | 'snowflake' | 'redshift' | 'supaglue';
  classType: 'analytical' | 'application';
  status: string;
  description: string;
};

export type AnalyticalDestinationCardInfo = DestinationCardInfo & {
  type: 'bigquery' | 'snowflake' | 'redshift';
};

export const postgresDestinationCardInfo: DestinationCardInfo = {
  icon: <Image alt="postgres" src={PostgresIcon} width={ICON_SIZE} height={ICON_SIZE} />,
  name: 'Postgres',
  type: 'postgres',
  classType: 'application',
  status: 'certified',
  description: 'Configure your Postgres destination.',
};

export const bigQueryDestinationCardInfo: DestinationCardInfo = {
  icon: <Image alt="bigquery" src={BigQueryIcon} width={ICON_SIZE} height={ICON_SIZE} />,
  name: 'BigQuery',
  type: 'bigquery',
  classType: 'analytical',
  status: '',
  description: 'Configure your BigQuery destination.',
};

export const snowflakeDestinationCardInfo: DestinationCardInfo = {
  icon: <Image alt="snowflake" src={SnowflakeQueryIcon} width={ICON_SIZE} height={ICON_SIZE} />,
  name: 'Snowflake',
  type: 'snowflake',
  classType: 'analytical',
  status: '',
  description: 'Configure your Snowflake destination.',
};

export const redshiftDestinationCardInfo: DestinationCardInfo = {
  icon: <Image alt="redshift" src={RedshiftQueryIcon} width={ICON_SIZE} height={ICON_SIZE} />,
  name: 'Redshift',
  type: 'redshift',
  classType: 'analytical',
  status: '',
  description: 'Configure your Redshift destination.',
};

export const supaglueDestinationCardInfo: DestinationCardInfo = {
  icon: <Image alt="supaglue" src={SupaglueIcon} width={ICON_SIZE} height={ICON_SIZE} />,
  name: 'Supaglue',
  type: 'supaglue',
  classType: 'application',
  status: 'certified',
  description: 'Use the Supaglue Managed destination and query for your data using the Supaglue Data API.',
};

export const destinationCardsInfo: DestinationCardInfo[] = [
  postgresDestinationCardInfo,
  supaglueDestinationCardInfo,
  bigQueryDestinationCardInfo,
  snowflakeDestinationCardInfo,
  redshiftDestinationCardInfo,
];

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
