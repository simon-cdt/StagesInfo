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

    const evaluations = await db.evaluationOffer.findMany({
      select: {
        id: true,
        rating: true,
        comment: true,
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
      },
    });

    const evaluationsWithStudent = await Promise.all(
      evaluations.map(async (evaluation) => {
        const student = await db.student.findFirst({
          where: {
            submissions: {
              some: {
                status: "Accepted",
                offer: {
                  evaluation: {
                    id: evaluation.id,
                  },
                },
              },
            },
          },
          select: {
            id: true,
            name: true,
            firstName: true,
          },
        });
        return {
          ...evaluation,
          student: {
            id: student?.id,
            firstName: student?.firstName,
            name: student?.name,
          },
        };
      }),
    );

    return NextResponse.json(evaluationsWithStudent);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
