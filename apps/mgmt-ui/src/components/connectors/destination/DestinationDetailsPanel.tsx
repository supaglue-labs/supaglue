import BigQueryDestinationDetailsPanel from './BigQueryDestinationDetailsPanel';
import PostgresDestinationDetailsPanel from './PostgresDestinationDetailsPanel';
import RedshiftDestinationDetailsPanel from './RedshiftDestinationDetailsPanel';
import SnowflakeDestinationDetailsPanel from './SnowflakeDestinationDetailsPanel';

export type DestinationDetailsPanelProps = {
  type: 'postgres' | 'bigquery' | 'snowflake' | 'redshift';
  isLoading: boolean;
};

export default function DestinationDetailsPanel({ type, isLoading }: DestinationDetailsPanelProps) {
  switch (type) {
    case 'postgres':
      return <PostgresDestinationDetailsPanel isLoading={isLoading} />;
    case 'bigquery':
      return <BigQueryDestinationDetailsPanel isLoading={isLoading} />;
    case 'snowflake':
      return <SnowflakeDestinationDetailsPanel isLoading={isLoading} />;
    case 'redshift':
      return <RedshiftDestinationDetailsPanel isLoading={isLoading} />;
    default:
      return null;
  }
}
