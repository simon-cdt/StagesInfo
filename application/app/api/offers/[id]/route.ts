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

  const offer = await db.offer.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      sector: {
        select: {
          label: true,
          color: true,
        },
      },
      title: true,
      status: true,
      location: true,
      duration: true,
      startDate: true,
      endDate: true,
      description: true,
      skills: true,
      company: {
        select: {
          name: true,
          address: true,
          email: true,
          contact: {
            select: {
              name: true,
              firstName: true,
              email: true,
            },
          },
        },
      },
      submissions: {
        select: {
          studentId: true,
        },
      },
    },
  });

  let alreadySubmit = false;
  if (session?.user?.id) {
    alreadySubmit = !!offer?.submissions.find(
      (submission) => submission.studentId === session.user.id,
    );
  }

  const dateToCompare = offer?.endDate ? offer?.endDate : new Date();
  const expired = new Date() > dateToCompare;

  return NextResponse.json({
    offer,
    expired,
    alreadySubmit,
  });
}
