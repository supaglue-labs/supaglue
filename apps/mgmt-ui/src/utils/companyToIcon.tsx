import SixSenseIcon from '@/assets/connector_icons/6sense.png';
import ActiveCampaignIcon from '@/assets/connector_icons/activecampaign.png';
import AmplitudeIcon from '@/assets/connector_icons/amplitude.png';
import ApolloIcon from '@/assets/connector_icons/apollo.webp';
import AsanaIcon from '@/assets/connector_icons/asana.png';
import BoxIcon from '@/assets/connector_icons/box.png';
import ChargebeeIcon from '@/assets/connector_icons/chargebee.png';
import ClearbitIcon from '@/assets/connector_icons/clearbit.png';
import CopperIcon from '@/assets/connector_icons/copper.png';
import DropboxIcon from '@/assets/connector_icons/dropbox.png';
import GCalIcon from '@/assets/connector_icons/gcal.png';
import GmailIcon from '@/assets/connector_icons/gmail.png';
import GongIcon from '@/assets/connector_icons/gong.webp';
import GAnalyticsIcon from '@/assets/connector_icons/google-analytics.png';
import GDriveIcon from '@/assets/connector_icons/google_drive.png';
import HubspotIcon from '@/assets/connector_icons/hubspot.png';
import IntercomIcon from '@/assets/connector_icons/intercom.png';
import LinearIcon from '@/assets/connector_icons/linear.svg';
import LinkedInIcon from '@/assets/connector_icons/linkedin.png';
import MarketoIcon from '@/assets/connector_icons/marketo.png';
import MessengerIcon from '@/assets/connector_icons/messenger.png';
import MixpanelIcon from '@/assets/connector_icons/mixpanel.webp';
import MicrosoftDynamics365SalesIcon from '@/assets/connector_icons/ms_dynamics_365_sales.svg';
import TeamsIcon from '@/assets/connector_icons/ms_teams.png';
import OneDriveIcon from '@/assets/connector_icons/onedrive.png';
import OutlookIcon from '@/assets/connector_icons/outlook.png';
import OutreachIcon from '@/assets/connector_icons/outreach.png';
import PipedriveIcon from '@/assets/connector_icons/pipedrive.png';
import SalesforceIcon from '@/assets/connector_icons/salesforce.png';
import SalesloftIcon from '@/assets/connector_icons/salesloft.webp';
import SegmentIcon from '@/assets/connector_icons/segment.png';
import SlackIcon from '@/assets/connector_icons/slack.png';
import StripeIcon from '@/assets/connector_icons/stripe.png';
import WhatsappIcon from '@/assets/connector_icons/whatsapp.png';
import ZendeskIcon from '@/assets/connector_icons/zendesk.png';
import ZendeskSellIcon from '@/assets/connector_icons/zendesk_sell.png';
import ZohoIcon from '@/assets/connector_icons/zoho_crm.png';
import ZoomIcon from '@/assets/connector_icons/zoom.png';
import ZoomInfoIcon from '@/assets/connector_icons/zoominfo.png';
import ZuoraIcon from '@/assets/connector_icons/zuora.png';
import BigQueryIcon from '@/assets/destination_icons/bigquery.png';
import PostgresIcon from '@/assets/destination_icons/postgres.png';
import S3Icon from '@/assets/destination_icons/s3.png';
import SupaglueIcon from '@/assets/supaglue.png';
import Image from 'next/image';
import type { ReactNode } from 'react';

export default function getIcon(name: string, size = 25): ReactNode {
  const companyToIconMap: Record<string, ReactNode> = {
    s3: <Image key={name} alt={name} src={S3Icon} width={size} height={size} style={{ objectFit: 'contain' }} />,
    postgres: (
      <Image key={name} alt={name} src={PostgresIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    bigquery: (
      <Image key={name} alt={name} src={BigQueryIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    salesforce: (
      <Image key={name} alt={name} src={SalesforceIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    hubspot: (
      <Image key={name} alt={name} src={HubspotIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    copper: (
      <Image key={name} alt={name} src={CopperIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    activecampaign: (
      <Image
        key={name}
        alt={name}
        src={ActiveCampaignIcon}
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
      />
    ),
    ms_dynamics_365_sales: (
      <Image
        key={name}
        alt={name}
        src={MicrosoftDynamics365SalesIcon}
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
      />
    ),
    linear: (
      <Image key={name} alt={name} src={LinearIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    pipedrive: (
      <Image key={name} alt={name} src={PipedriveIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    zendesk_sell: (
      <Image key={name} alt={name} src={ZendeskSellIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    outreach: (
      <Image key={name} alt={name} src={OutreachIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    six_sense: (
      <Image key={name} alt={name} src={SixSenseIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    gong: <Image key={name} alt={name} src={GongIcon} width={size} height={size} style={{ objectFit: 'contain' }} />,
    amplitude: (
      <Image key={name} alt={name} src={AmplitudeIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    apollo: (
      <Image key={name} alt={name} src={ApolloIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    asana: <Image key={name} alt={name} src={AsanaIcon} width={size} height={size} style={{ objectFit: 'contain' }} />,
    salesloft: (
      <Image key={name} alt={name} src={SalesloftIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    box: <Image key={name} alt={name} src={BoxIcon} width={size} height={size} style={{ objectFit: 'contain' }} />,
    chargebee: (
      <Image key={name} alt={name} src={ChargebeeIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    clearbit: (
      <Image key={name} alt={name} src={ClearbitIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    dropbox: (
      <Image key={name} alt={name} src={DropboxIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    google_calendar: (
      <Image key={name} alt={name} src={GCalIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    gmail: <Image key={name} alt={name} src={GmailIcon} width={size} height={size} style={{ objectFit: 'contain' }} />,
    google_drive: (
      <Image key={name} alt={name} src={GDriveIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    google_analytics: (
      <Image key={name} alt={name} src={GAnalyticsIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    intercom: (
      <Image key={name} alt={name} src={IntercomIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    linkedin: (
      <Image key={name} alt={name} src={LinkedInIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    marketo: (
      <Image key={name} alt={name} src={MarketoIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    messenger: (
      <Image key={name} alt={name} src={MessengerIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    mixpanel: (
      <Image key={name} alt={name} src={MixpanelIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    ms_teams: (
      <Image key={name} alt={name} src={TeamsIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    onedrive: (
      <Image key={name} alt={name} src={OneDriveIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    outlook: (
      <Image key={name} alt={name} src={OutlookIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    salesforce_marketing_cloud_account_engagement: (
      <Image key={name} alt={name} src={SalesforceIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    segment: (
      <Image key={name} alt={name} src={SegmentIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    slack: <Image key={name} alt={name} src={SlackIcon} width={size} height={size} style={{ objectFit: 'contain' }} />,
    stripe: (
      <Image key={name} alt={name} src={StripeIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    whatsapp: (
      <Image key={name} alt={name} src={WhatsappIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    zendesk: (
      <Image key={name} alt={name} src={ZendeskIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    zoho: <Image key={name} alt={name} src={ZohoIcon} width={size} height={size} style={{ objectFit: 'contain' }} />,
    zoom: <Image key={name} alt={name} src={ZoomIcon} width={size} height={size} style={{ objectFit: 'contain' }} />,
    zoominfo: (
      <Image key={name} alt={name} src={ZoomInfoIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
    zuora: <Image key={name} alt={name} src={ZuoraIcon} width={size} height={size} style={{ objectFit: 'contain' }} />,
    supaglue: (
      <Image key={name} alt={name} src={SupaglueIcon} width={size} height={size} style={{ objectFit: 'contain' }} />
    ),
  };

  return companyToIconMap[name];
}
