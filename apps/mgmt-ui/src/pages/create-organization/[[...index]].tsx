import { CreateOrganization } from '@clerk/nextjs';
import { getServerSideProps } from '..';

export { getServerSideProps };

export default function CreateOrganizationPage() {
  return (
    <div className="m-auto">
      <CreateOrganization />
    </div>
  );
}
