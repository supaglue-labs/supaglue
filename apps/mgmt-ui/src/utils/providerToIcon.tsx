import ActiveCampaignIcon from '@/assets/connector_icons/activecampaign.png';
import CopperIcon from '@/assets/connector_icons/copper.png';
import HubspotIcon from '@/assets/connector_icons/hubspot.png';
import MicrosoftDynamics365SalesIcon from '@/assets/connector_icons/ms_dynamics_365_sales.png';
import OutreachIcon from '@/assets/connector_icons/outreach.png';
import PipedriveIcon from '@/assets/connector_icons/pipedrive.png';
import SalesforceIcon from '@/assets/connector_icons/salesforce.png';
import ZendeskSellIcon from '@/assets/connector_icons/zendesk_sell.png';
import Image from 'next/image';
import { ReactNode } from 'react';

export default function providerToIcon(providerName: string, size = 25): ReactNode {
  const providerToIconMap: Record<string, ReactNode> = {
    salesforce: <Image key={providerName} alt={providerName} src={SalesforceIcon} width={size} height={size} />,
    hubspot: <Image key={providerName} alt={providerName} src={HubspotIcon} width={size} height={size} />,
    copper: <Image key={providerName} alt={providerName} src={CopperIcon} width={size} height={size} />,
    activecampaign: <Image key={providerName} alt={providerName} src={ActiveCampaignIcon} width={size} height={size} />,
    ms_dynamics_365_sales: (
      <Image key={providerName} alt={providerName} src={MicrosoftDynamics365SalesIcon} width={size} height={size} />
    ),
    pipedrive: <Image key={providerName} alt={providerName} src={PipedriveIcon} width={size} height={size} />,
    zendesk_sell: <Image key={providerName} alt={providerName} src={ZendeskSellIcon} width={size} height={size} />,
    outreach: <Image key={providerName} alt={providerName} src={OutreachIcon} width={size} height={size} />,
  };

  return providerToIconMap[providerName];
}
