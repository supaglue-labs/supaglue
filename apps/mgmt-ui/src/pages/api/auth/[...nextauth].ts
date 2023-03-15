import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { API_HOST, APPLICATION_ID, SG_INTERNAL_TOKEN } from '..';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Username/Password',
      async authorize(credentials) {
        const authResponse = await fetch(`${API_HOST}/internal/v1/auth/_login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-application-id': APPLICATION_ID, // TODO: un-hardcode
            'x-sg-internal-token': SG_INTERNAL_TOKEN,
          },
          body: JSON.stringify({
            ...credentials,
          }),
        });

        if (!authResponse.ok) {
          return null;
        }

        const user = await authResponse.json();

        return {
          ...user,
          name: user.username,
          email: null,
          image: null,
        };
      },
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
    }),
  ],
  secret: process.env.SUPAGLUE_JWT_SECRET,
};

export default NextAuth(authOptions);
