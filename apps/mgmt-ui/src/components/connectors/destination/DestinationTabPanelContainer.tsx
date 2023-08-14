import BigQueryIcon from '@/assets/destination_icons/bigquery.png';
import MongoDBIcon from '@/assets/destination_icons/mongodb.png';
import PostgresIcon from '@/assets/destination_icons/postgres.png';
import S3Icon from '@/assets/destination_icons/s3.png';
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
  type: 's3' | 'postgres' | 'bigquery' | 'mongodb';
  description: string;
};

export const s3DestinationCardInfo: DestinationCardInfo = {
  icon: <Image alt="s3" src={S3Icon} width={ICON_SIZE} height={ICON_SIZE} />,
  name: 'AWS S3',
  type: 's3',
  description: 'Configure your S3 destination.',
};

export const postgresDestinationCardInfo: DestinationCardInfo = {
  icon: <Image alt="postgres" src={PostgresIcon} width={ICON_SIZE} height={ICON_SIZE} />,
  name: 'Postgres',
  type: 'postgres',
  description: 'Configure your Postgres destination.',
};

export const bigQueryDestinationCardInfo: DestinationCardInfo = {
  icon: <Image alt="bigquery" src={BigQueryIcon} width={ICON_SIZE} height={ICON_SIZE} />,
  name: 'BigQuery',
  type: 'bigquery',
  description: 'Configure your BigQuery destination.',
};

export const mongoDBDestinationCardInfo: DestinationCardInfo = {
  icon: <Image alt="mongodb" src={MongoDBIcon} width={ICON_SIZE} height={ICON_SIZE} />,
  name: 'MongoDB',
  type: 'mongodb',
  description: 'Configure your MongoDB destination.',
};

export const destinationCardsInfo: DestinationCardInfo[] = [
  s3DestinationCardInfo,
  postgresDestinationCardInfo,
  bigQueryDestinationCardInfo,
  mongoDBDestinationCardInfo,
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
      {isDetailPage && <DestinationDetailsPanel isLoading={isLoading} type={type as 's3' | 'postgres'} />}
    </TabPanel>
  );
}
