import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const offers = await db.offer.findMany({
    where: {
      companyId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      sector: {
        select: {
          id: true,
          color: true,
          label: true,
        },
      },
      duration: true,
      startDate: true,
      endDate: true,
      location: true,
      status: true,
      skills: true,
    },
  });

  const currentDate = new Date();

  offers.forEach((offer) => {
    if (
      offer.endDate &&
      new Date(offer.endDate) < currentDate &&
      offer.status !== "Completed"
    ) {
      offer.status = "Expired";
    }
  });

  return NextResponse.json(offers);
}
