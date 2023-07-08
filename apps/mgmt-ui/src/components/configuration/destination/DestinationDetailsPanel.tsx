import BigQueryDestinationDetailsPanel from './BigQueryDestinationDetailsPanel';
import PostgresDestinationDetailsPanel from './PostgresDestinationDetailsPanel';
import S3DestinationDetailsPanel from './S3DestinationDetailsPanel';

export type DestinationDetailsPanelProps = {
  type: 's3' | 'postgres' | 'bigquery';
  isLoading: boolean;
};

export default function DestinationDetailsPanel({ type, isLoading }: DestinationDetailsPanelProps) {
  switch (type) {
    case 's3':
      return <S3DestinationDetailsPanel isLoading={isLoading} />;
    case 'postgres':
      return <PostgresDestinationDetailsPanel isLoading={isLoading} />;
    case 'bigquery':
      return <BigQueryDestinationDetailsPanel isLoading={isLoading} />;
    default:
      return null;
  }
}
