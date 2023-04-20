import PostgresDestinationDetailsPanel from './PostgresDestinationDetailsPane';
import S3DestinationDetailsPanel from './S3DestinationDetailsPanel';

export type DestinationDetailsPanelProps = {
  type: 's3' | 'postgres';
  isLoading: boolean;
};

export default function DestinationDetailsPanel({ type, isLoading }: DestinationDetailsPanelProps) {
  if (type === 's3') {
    return <S3DestinationDetailsPanel isLoading={isLoading} />;
  }
  return <PostgresDestinationDetailsPanel isLoading={isLoading} />;
}
