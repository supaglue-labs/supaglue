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

export default function companyToIcon(company: string, size = 25): ReactNode {
  const companyToIconMap: Record<string, ReactNode> = {
    s3: <Image key={company} alt={company} src={S3Icon} width={size} height={size} />,
    postgres: <Image key={company} alt={company} src={PostgresIcon} width={size} height={size} />,
    salesforce: <Image key={company} alt={company} src={SalesforceIcon} width={size} height={size} />,
    hubspot: <Image key={company} alt={company} src={HubspotIcon} width={size} height={size} />,
    copper: <Image key={company} alt={company} src={CopperIcon} width={size} height={size} />,
    activecampaign: <Image key={company} alt={company} src={ActiveCampaignIcon} width={size} height={size} />,
    ms_dynamics_365_sales: (
      <Image key={company} alt={company} src={MicrosoftDynamics365SalesIcon} width={size} height={size} />
    ),
    pipedrive: <Image key={company} alt={company} src={PipedriveIcon} width={size} height={size} />,
    zendesk_sell: <Image key={company} alt={company} src={ZendeskSellIcon} width={size} height={size} />,
  };

  return companyToIconMap[company];
}
