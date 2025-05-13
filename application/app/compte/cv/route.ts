import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const etudiant = await db.etudiant.findUnique({
    where: { id: session.user.id },
    select: { nom: true, cv: true },
  });

  if (!etudiant || !etudiant.cv) {
    return new Response("Document not found", { status: 404 });
  }

  return new Response(etudiant.cv, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${etudiant.nom}.pdf"`,
    },
  });
}
