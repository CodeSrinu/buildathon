import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Email and password are required');
          return null; // Return null instead of throwing to be handled by NextAuth
        }

        // For email/password authentication, we're using Supabase
        try {
          const { createClient } = await import('@supabase/supabase-js');
          
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

          if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Missing Supabase configuration');
            return null; // Return null instead of throwing to be handled by NextAuth
          }

          const supabase = createClient(supabaseUrl, supabaseAnonKey);

          // Try to get user from Supabase auth
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error('Authentication error:', error);
            return null; // Return null instead of throwing to be handled by NextAuth
          }

          // If login is successful, return user data
          if (data?.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || data.user.email,
            };
          }

          return null; // Return null instead of throwing to be handled by NextAuth
        } catch (error) {
          console.error('Error during authorization:', error);
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    // Set to true if using issued/expiration times for JWT
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token, user }) {
      // Add the user id to the session object
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      
      // Ensure session is properly structured
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub || user?.id || session.user?.id
        }
      };
    },
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      // The profile type varies depending on the provider
      // For Google provider, we check for sub from account.providerAccountId
      if (profile) {
        token.sub = profile.sub ?? token.sub;
      }
      
      // Include user id in token for consistency
      if (user) {
        token.sub = user.id ?? token.sub;
      }
      
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    error: "/auth/error",
    signIn: "/",
  },
  // Add debug mode in development
  debug: process.env.NODE_ENV === 'development',
};