import { NextResponse } from "next/server";
import { getSystemStatus } from "@/lib/system-status";

export async function GET() {
  return NextResponse.json({ status: getSystemStatus() }, { status: 200 });
}
