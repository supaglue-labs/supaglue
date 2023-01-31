import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compareSync } from 'bcryptjs';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '../../../lib/prismadb';

const providers = [
  CredentialsProvider({
    // The name to display on the sign in form (e.g. "Sign in with...")
    name: 'username and password',
    // `credentials` is used to generate a form on the sign in page.
    // You can specify which fields should be submitted, by adding keys to the `credentials` object.
    // e.g. domain, username, password, 2FA token, etc.
    // You can pass any HTML attribute to the <input> tag through the object.
    credentials: {
      username: { label: 'Username', type: 'text' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.username) {
        return null;
      }
      const user = await prisma.user.findUnique({
        where: {
          name: credentials.username,
        },
      });

      if (!user) {
        return null;
      }

      const pwMatch = compareSync(credentials.password, user.password);

      if (pwMatch) {
        return user;
      }
      return null;
    },
  }),
];

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: 'jwt',
  },
});
