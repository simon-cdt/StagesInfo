import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const offers = await db.offer.findMany({
    where: {
      status: "Available",
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
    select: {
      id: true,
      title: true,
      company: {
        select: {
          name: true,
        },
      },
      sector: {
        select: {
          label: true,
          color: true,
        },
      },
      duration: true,
      startDate: true,
      endDate: true,
      location: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return NextResponse.json(offers);
}
