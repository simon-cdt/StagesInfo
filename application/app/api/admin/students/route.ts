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

    const students = await db.student.findMany({
      select: {
        id: true,
        name: true,
        firstName: true,
        email: true,
        skills: true,
        submissions: {
          select: {
            status: true,
          },
        },
      },
    });

    const studentsWithDeletable = students.map((students) => {
      const hasAcceptedSubmission = students.submissions.some(
        (submission) => submission.status === "Accepted",
      );
      return {
        ...students,
        deleteable: !hasAcceptedSubmission,
        submissions: undefined,
      };
    });

    return NextResponse.json(studentsWithDeletable);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
