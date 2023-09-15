import BigQueryDestinationDetailsPanel from './BigQueryDestinationDetailsPanel';
import MongoDBDestinationDetailsPanel from './MongoDBDestinationDetailsPanel';
import PostgresDestinationDetailsPanel from './PostgresDestinationDetailsPanel';

export type DestinationDetailsPanelProps = {
  type: 'postgres' | 'bigquery' | 'mongodb';
  isLoading: boolean;
};

export default function DestinationDetailsPanel({ type, isLoading }: DestinationDetailsPanelProps) {
  switch (type) {
    case 'postgres':
      return <PostgresDestinationDetailsPanel isLoading={isLoading} />;
    case 'bigquery':
      return <BigQueryDestinationDetailsPanel isLoading={isLoading} />;
    case 'mongodb':
      return <MongoDBDestinationDetailsPanel isLoading={isLoading} />;
    default:
      return null;
  }
}
