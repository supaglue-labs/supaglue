import PostgresDestinationDetailsPanel from './PostgresDestinationDetailsPanel';

export type DestinationDetailsPanelProps = {
  type: 'postgres';
  isLoading: boolean;
};

export default function DestinationDetailsPanel({ type, isLoading }: DestinationDetailsPanelProps) {
  switch (type) {
    case 'postgres':
      return <PostgresDestinationDetailsPanel isLoading={isLoading} />;
    default:
      return null;
  }
}
