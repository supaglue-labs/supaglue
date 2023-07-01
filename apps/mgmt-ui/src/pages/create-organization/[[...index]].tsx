import { CreateOrganization } from '@clerk/nextjs';
import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: { session: null, signedIn: false },
  };
};

export default function CreateOrganizationPage() {
  return (
    <div className="m-auto">
      <CreateOrganization afterCreateOrganizationUrl="/" />
    </div>
  );
}
