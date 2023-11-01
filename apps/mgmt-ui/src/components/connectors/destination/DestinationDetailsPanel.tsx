import BigQueryDestinationDetailsPanel from './BigQueryDestinationDetailsPanel';
import PostgresDestinationDetailsPanel from './PostgresDestinationDetailsPanel';

export type DestinationDetailsPanelProps = {
  type: 'postgres' | 'bigquery';
  isLoading: boolean;
};

export default function DestinationDetailsPanel({ type, isLoading }: DestinationDetailsPanelProps) {
  switch (type) {
    case 'postgres':
      return <PostgresDestinationDetailsPanel isLoading={isLoading} />;
    case 'bigquery':
      return <BigQueryDestinationDetailsPanel isLoading={isLoading} />;
    default:
      return null;
  }
}
