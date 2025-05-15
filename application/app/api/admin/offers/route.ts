import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const offers = await db.offer.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true,
        skills: true,
        duration: true,
        location: true,
        sector: {
          select: {
            id: true,
            label: true,
            color: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const date = new Date();

    const offersWithDeletable = offers.map((offer) => {
      const hasOfferFinished = offer.status === "Completed";
      const expired = offer.endDate < date;
      return {
        ...offer,
        deleteable: !hasOfferFinished,
        expired,
      };
    });

    return NextResponse.json(offersWithDeletable);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
