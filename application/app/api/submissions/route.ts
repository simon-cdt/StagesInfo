import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "student") {
    return NextResponse.json({ message: "Vous n'avez pas de candidatures" });
  }

  const submissions = await db.submission.findMany({
    where: {
      studentId: session.user.id,
    },
    select: {
      id: true,
      date: true,
      status: true,
      offer: {
        select: {
          id: true,
          title: true,
          status: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(submissions);
}
