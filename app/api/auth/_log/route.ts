import { NextResponse } from "next/server";

// NextAuth internal logging endpoint
export async function POST(request: Request) {
  // NextAuth uses this endpoint for internal logging
  // Return success to prevent errors
  return NextResponse.json({ message: "OK" });
}

// Add other methods that might be called by NextAuth
export async function GET() {
  return NextResponse.json({ message: "Auth logging endpoint" });
}

export async function PUT(request: Request) {
  return NextResponse.json({ message: "OK" });
}

export async function DELETE(request: Request) {
  return NextResponse.json({ message: "OK" });
}