import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password.');
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();

        // Query user from Supabase
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (error) {
          console.error('NextAuth authorize database error:', error);
          throw new Error('Authentication database query failed.');
        }

        if (!user) {
          throw new Error('No account found with this email.');
        }

        // Compare password hash
        const isValid = bcrypt.compareSync(credentials.password, user.password_hash);
        if (!isValid) {
          throw new Error('Invalid email or password.');
        }

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const email = user.email?.trim().toLowerCase();
        if (!email) return false;

        // Check if user already exists in Supabase
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (checkError) {
          console.error('OAuth signin database check failed:', checkError);
          return false;
        }

        if (!existingUser) {
          // Auto-register user with a unique placeholder password_hash
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              email,
              password_hash: 'oauth-google-user-' + Math.random().toString(36).substring(2),
            })
            .select('id')
            .single();

          if (insertError) {
            console.error('OAuth registration failed:', insertError);
            return false;
          }
          user.id = newUser.id;
        } else {
          user.id = existingUser.id;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
