import { SignIn } from '@clerk/nextjs';
import { getServerSideProps } from '..';

export { getServerSideProps };

const SignInPage = () => {
  return <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />;
};

export default SignInPage;
