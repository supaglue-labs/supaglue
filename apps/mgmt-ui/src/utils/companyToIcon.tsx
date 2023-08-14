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
import PardotIcon from '@/assets/connector_icons/pardot.png';
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
import MongoDBIcon from '@/assets/destination_icons/mongodb.png';
import PostgresIcon from '@/assets/destination_icons/postgres.png';
import S3Icon from '@/assets/destination_icons/s3.png';
import SupaglueIcon from '@/assets/supaglue.png';
import Image from 'next/image';
import type { ReactNode } from 'react';

export default function getIcon(name: string, size = 25): ReactNode {
  const companyToIconMap: Record<string, ReactNode> = {
    s3: <Image key={name} alt={name} src={S3Icon} width={size} height={size} />,
    postgres: <Image key={name} alt={name} src={PostgresIcon} width={size} height={size} />,
    bigquery: <Image key={name} alt={name} src={BigQueryIcon} width={size} height={size} />,
    salesforce: <Image key={name} alt={name} src={SalesforceIcon} width={size} height={size} />,
    hubspot: <Image key={name} alt={name} src={HubspotIcon} width={size} height={size} />,
    copper: <Image key={name} alt={name} src={CopperIcon} width={size} height={size} />,
    activecampaign: <Image key={name} alt={name} src={ActiveCampaignIcon} width={size} height={size} />,
    mongodb: <Image key={name} alt={name} src={MongoDBIcon} width={size} height={size} />,
    ms_dynamics_365_sales: (
      <Image key={name} alt={name} src={MicrosoftDynamics365SalesIcon} width={size} height={size} />
    ),
    linear: <Image key={name} alt={name} src={LinearIcon} width={size} height={size} />,
    pipedrive: <Image key={name} alt={name} src={PipedriveIcon} width={size} height={size} />,
    zendesk_sell: <Image key={name} alt={name} src={ZendeskSellIcon} width={size} height={size} />,
    outreach: <Image key={name} alt={name} src={OutreachIcon} width={size} height={size} />,
    six_sense: <Image key={name} alt={name} src={SixSenseIcon} width={size} height={size} />,
    gong: <Image key={name} alt={name} src={GongIcon} width={size} height={size} />,
    amplitude: <Image key={name} alt={name} src={AmplitudeIcon} width={size} height={size} />,
    apollo: <Image key={name} alt={name} src={ApolloIcon} width={size} height={size} />,
    asana: <Image key={name} alt={name} src={AsanaIcon} width={size} height={size} />,
    salesloft: <Image key={name} alt={name} src={SalesloftIcon} width={size} height={size} />,
    box: <Image key={name} alt={name} src={BoxIcon} width={size} height={size} />,
    chargebee: <Image key={name} alt={name} src={ChargebeeIcon} width={size} height={size} />,
    clearbit: <Image key={name} alt={name} src={ClearbitIcon} width={size} height={size} />,
    dropbox: <Image key={name} alt={name} src={DropboxIcon} width={size} height={size} />,
    google_calendar: <Image key={name} alt={name} src={GCalIcon} width={size} height={size} />,
    gmail: <Image key={name} alt={name} src={GmailIcon} width={size} height={size} />,
    google_drive: <Image key={name} alt={name} src={GDriveIcon} width={size} height={size} />,
    google_analytics: <Image key={name} alt={name} src={GAnalyticsIcon} width={size} height={size} />,
    intercom: <Image key={name} alt={name} src={IntercomIcon} width={size} height={size} />,
    linkedin: <Image key={name} alt={name} src={LinkedInIcon} width={size} height={size} />,
    marketo: <Image key={name} alt={name} src={MarketoIcon} width={size} height={size} />,
    messenger: <Image key={name} alt={name} src={MessengerIcon} width={size} height={size} />,
    mixpanel: <Image key={name} alt={name} src={MixpanelIcon} width={size} height={size} />,
    ms_teams: <Image key={name} alt={name} src={TeamsIcon} width={size} height={size} />,
    onedrive: <Image key={name} alt={name} src={OneDriveIcon} width={size} height={size} />,
    outlook: <Image key={name} alt={name} src={OutlookIcon} width={size} height={size} />,
    pardot: <Image key={name} alt={name} src={PardotIcon} width={size} height={size} />,
    segment: <Image key={name} alt={name} src={SegmentIcon} width={size} height={size} />,
    slack: <Image key={name} alt={name} src={SlackIcon} width={size} height={size} />,
    stripe: <Image key={name} alt={name} src={StripeIcon} width={size} height={size} />,
    whatsapp: <Image key={name} alt={name} src={WhatsappIcon} width={size} height={size} />,
    zendesk: <Image key={name} alt={name} src={ZendeskIcon} width={size} height={size} />,
    zoho: <Image key={name} alt={name} src={ZohoIcon} width={size} height={size} />,
    zoom: <Image key={name} alt={name} src={ZoomIcon} width={size} height={size} />,
    zoominfo: <Image key={name} alt={name} src={ZoomInfoIcon} width={size} height={size} />,
    zuora: <Image key={name} alt={name} src={ZuoraIcon} width={size} height={size} />,
    supaglue: <Image key={name} alt={name} src={SupaglueIcon} width={size} height={size} />,
  };

  return companyToIconMap[name];
}
