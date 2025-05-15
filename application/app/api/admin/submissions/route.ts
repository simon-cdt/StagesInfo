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

    const submissions = await db.submission.findMany({
      select: {
        id: true,
        date: true,
        offer: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        status: true,
        student: {
          select: {
            id: true,
            name: true,
            firstName: true,
            email: true,
          },
        },
      },
    });

    const submissionsWithDeletable = submissions.map((submission) => {
      const hasAcceptedSubmission =
        submission.status === "Accepted" || submission.status === "Rejected";
      return {
        ...submission,
        deleteable: !hasAcceptedSubmission,
      };
    });

    return NextResponse.json(submissionsWithDeletable);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
