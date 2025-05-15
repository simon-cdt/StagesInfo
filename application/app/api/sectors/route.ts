import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const sectors = await db.sector.findMany({
    select: {
      id: true,
      label: true,
      color: true,
    },
  });

  return NextResponse.json(sectors);
}
