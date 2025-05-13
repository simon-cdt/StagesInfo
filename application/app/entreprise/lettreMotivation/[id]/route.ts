import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || !session.user?.id || session.user.role !== "entreprise") {
    return new Response("Unauthorized", { status: 401 });
  }

  const candidature = await db.candidature.findUnique({
    where: { id },
    select: { lettreMotivation: true, etudiant: { select: { nom: true } } },
  });

  if (!candidature || !candidature.lettreMotivation) {
    return new Response("Document not found", { status: 404 });
  }

  return new Response(candidature.lettreMotivation, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${candidature.etudiant.nom}.pdf"`,
    },
  });
}
