import ActiveCampaignIcon from '@/assets/connector_icons/activecampaign.png';
import CopperIcon from '@/assets/connector_icons/copper.png';
import HubspotIcon from '@/assets/connector_icons/hubspot.png';
import MicrosoftDynamics365SalesIcon from '@/assets/connector_icons/ms_dynamics_365_sales.png';
import PipedriveIcon from '@/assets/connector_icons/pipedrive.png';
import SalesforceIcon from '@/assets/connector_icons/salesforce.png';
import ZendeskSellIcon from '@/assets/connector_icons/zendesk_sell.png';
import PostgresIcon from '@/assets/destination_icons/postgres.png';
import S3Icon from '@/assets/destination_icons/s3.png';
import Image from 'next/image';
import { ReactNode } from 'react';

export default function getIcon(name: string, size = 25): ReactNode {
  const companyToIconMap: Record<string, ReactNode> = {
    s3: <Image key={name} alt={name} src={S3Icon} width={size} height={size} />,
    postgres: <Image key={name} alt={name} src={PostgresIcon} width={size} height={size} />,
    salesforce: <Image key={name} alt={name} src={SalesforceIcon} width={size} height={size} />,
    hubspot: <Image key={name} alt={name} src={HubspotIcon} width={size} height={size} />,
    copper: <Image key={name} alt={name} src={CopperIcon} width={size} height={size} />,
    activecampaign: <Image key={name} alt={name} src={ActiveCampaignIcon} width={size} height={size} />,
    ms_dynamics_365_sales: (
      <Image key={name} alt={name} src={MicrosoftDynamics365SalesIcon} width={size} height={size} />
    ),
    pipedrive: <Image key={name} alt={name} src={PipedriveIcon} width={size} height={size} />,
    zendesk_sell: <Image key={name} alt={name} src={ZendeskSellIcon} width={size} height={size} />,
  };

  return companyToIconMap[name];
}
