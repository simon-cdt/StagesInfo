import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const submission = await db.submission.findUnique({
    where: { id },
    select: { resume: true, studentId: true },
  });

  if (session.user.id !== submission?.studentId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!submission || !submission.resume) {
    return new Response("Document not found", { status: 404 });
  }

  return new Response(submission.resume, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${id}.pdf"`,
    },
  });
}
