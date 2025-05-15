import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const submissions = await db.submission.findMany({
    where: {
      status: "Accepted",
      offer: {
        companyId: session.user.id,
      },
    },
    select: {
      id: true,
      student: {
        select: {
          id: true,
          name: true,
          firstName: true,
          email: true,
        },
      },
      offer: {
        select: {
          id: true,
          title: true,
          evaluation: {
            select: {
              id: true,
              rating: true,
              comment: true,
              date: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(submissions);
}
