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

  const candidature = await db.candidature.findUnique({
    where: { id },
    select: { cv: true, etudiantId: true },
  });

  if (session.user.id !== candidature?.etudiantId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!candidature || !candidature.cv) {
    return new Response("Document not found", { status: 404 });
  }

  return new Response(candidature.cv, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${id}.pdf"`,
    },
  });
}
