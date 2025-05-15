import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  const submission = await db.submission.findUnique({
    where: { id },
    select: { motivationLetter: true, student: { select: { name: true } } },
  });

  if (!submission || !submission.motivationLetter) {
    return new Response("Document not found", { status: 404 });
  }

  return new Response(submission.motivationLetter, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${submission.student.name}.pdf"`,
    },
  });
}
