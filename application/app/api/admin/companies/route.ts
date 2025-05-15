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

    const companies = await db.company.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        email: true,
        sectors: {
          select: {
            sector: {
              select: {
                id: true,
                label: true,
                color: true,
              },
            },
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
            firstName: true,
            email: true,
          },
        },
        offers: {
          select: {
            status: true,
          },
        },
      },
    });

    const companiesWithDeletable = companies.map((companies) => {
      const hasOfferFinished = companies.offers.some(
        (offer) => offer.status === "Completed",
      );
      return {
        ...companies,
        deleteable: !hasOfferFinished,
        offers: undefined,
      };
    });

    return NextResponse.json(companiesWithDeletable);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
