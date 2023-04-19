import PostgresIcon from '@/assets/destination_icons/postgres.png';
import S3Icon from '@/assets/destination_icons/s3.png';
import { useDestinations } from '@/hooks/useDestinations';
import Box from '@mui/material/Box';
import Image from 'next/image';
import { useRouter } from 'next/router';
import * as React from 'react';
import DestinationDetailsPanel from './DestinationDetailsPanel';
import DestinationsListPanel from './DestinationsTabPanel';

const ICON_SIZE = 35;

export type DestinationCardInfo = {
  icon?: React.ReactNode;
  name: string;
  type: 's3' | 'postgres';
  description: string;
};

export const destinationCardsInfo: DestinationCardInfo[] = [
  {
    icon: <Image alt="s3" src={S3Icon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'AWS S3',
    type: 's3',
    description: 'Configure your S3 destination.',
  },
  {
    icon: <Image alt="postgres" src={PostgresIcon} width={ICON_SIZE} height={ICON_SIZE} />,
    name: 'Postgres',
    type: 'postgres',
    description: 'Configure your Postgres destination.',
  },
];

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function IntegrationTabPanelContainer() {
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
