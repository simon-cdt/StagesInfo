import FormModifyCompanyContactInformations from "@/components/form/modify/CompanyContactInformations";
import { getEntrepriseContactSession } from "@/lib/actions/entreprise";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function EntrepriseContact() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role) {
    redirect("/login");
  }

  if (session.user.role === "entreprise") {
    const response = await getEntrepriseContactSession({ id: session.user.id });
    if (!response.success) {
      redirect("/login");
    }
    return (
      <FormModifyCompanyContactInformations
        contact={response.entrepriseContact}
      />
    );
  } else {
    redirect("/account");
  }
}
