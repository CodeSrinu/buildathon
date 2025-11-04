// app/profile/route.ts - Returns session info to client
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Return session data or null if not authenticated
    // This format is expected by NextAuth client-side hooks
    return NextResponse.json(session || null);
  } catch (error) {
    console.error('Profile API error:', error);
    // Return null session on error to match NextAuth expectations
    return NextResponse.json(null);
  }
}