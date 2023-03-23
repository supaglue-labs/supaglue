import { SignIn } from '@clerk/nextjs';
import { getServerSideProps } from '..';

export { getServerSideProps };

const SignInPage = () => {
  return (
    <div className="m-auto">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
};

export default SignInPage;
