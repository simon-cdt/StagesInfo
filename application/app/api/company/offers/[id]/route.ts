import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || session.user.role !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const submissions = await db.submission.findMany({
    where: {
      offerId: id,
    },
    select: {
      id: true,
      student: {
        select: {
          id: true,
          name: true,
          firstName: true,
          email: true,
          skills: true,
        },
      },
      date: true,
      status: true,
      offer: {
        select: {
          status: true,
          endDate: true,
        },
      },
    },
  });

  const submissionsWithDisable = submissions.map((submission) => ({
    ...submission,
    disable:
      new Date(submission.offer.endDate) < new Date() ||
      submission.offer.status !== "Available",
  }));

  return NextResponse.json(submissionsWithDisable);
}
