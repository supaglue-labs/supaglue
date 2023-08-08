import { SignUp } from '@clerk/nextjs';
import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: { session: null, signedIn: false },
  };
};

const SignUpPage = () => (
  <div className="m-auto">
    <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
  </div>
);

export default SignUpPage;
