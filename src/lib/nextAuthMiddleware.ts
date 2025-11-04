// src/lib/nextAuthMiddleware.ts
import NextAuth from 'next-auth';
import { authOptions } from './auth';

// Create a single instance of NextAuth
const handler = NextAuth(authOptions);

export default handler;