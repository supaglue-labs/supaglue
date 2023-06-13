import { SignIn } from '@clerk/nextjs';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: { session: null, signedIn: false },
  };
};

const SignInPage = () => {
  return (
    <div className="m-auto">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" afterSignUpUrl="/create-organization" />
    </div>
  );
};

export default SignInPage;
