import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "student") {
    return NextResponse.json({ message: "Vous n'avez pas de candidatures" });
  }

  const ranking = await db.offer.findMany({
    where: {
      submissions: {
        some: {
          studentId: session.user.id,
          status: "Accepted",
        },
      },
    },
    select: {
      id: true,
      evaluation: {
        select: {
          rating: true,
          date: true,
          comment: true,
        },
      },
      title: true,
      company: {
        select: {
          name: true,
          contact: {
            select: {
              name: true,
              firstName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(ranking);
}
