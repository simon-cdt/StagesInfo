import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const student = await db.student.findUnique({
    where: { id: session.user.id },
    select: { name: true, resume: true },
  });

  if (!student || !student.resume) {
    return new Response("Document not found", { status: 404 });
  }

  return new Response(student.resume, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${student.name}.pdf"`,
    },
  });
}
