// app/api/auth/session/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json(session || null);
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}