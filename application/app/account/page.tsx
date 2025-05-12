import FormModifyInformationsCompany from "@/components/form/modify/CompanyInformations";
import FormModifyInformationsStudent from "@/components/form/modify/StudentInformations";
import { getEntrepriseSession } from "@/lib/actions/entreprise";
import { getEtudiantSession } from "@/lib/actions/etudiant";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role) {
    redirect("/login");
  }

  if (session.user.role === "etudiant") {
    const response = await getEtudiantSession({ id: session.user.id });
    if (!response.success) {
      redirect("/");
    }
    return <FormModifyInformationsStudent etudiant={response.etudiant} />;
  } else if (session.user.role === "entreprise") {
    const response = await getEntrepriseSession({ id: session.user.id });
    if (!response.success) {
      redirect("/login");
    }
    return (
      <FormModifyInformationsCompany
        entreprise={response.entreprise}
        secteurs={response.secteurs}
      />
    );
  } else if (session.user.role === "admin") {
    redirect("/account/password");
  }

  redirect("/");
}
