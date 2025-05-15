import UpdateCompanyContactInformationsForm from "@/components/form/UpdateAccount/CompanyContactInformations";
import { getCompanyContactSession } from "@/lib/actions/company";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function EntrepriseContact() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role) {
    redirect("/login");
  }

  if (session.user.role === "company") {
    const response = await getCompanyContactSession({ id: session.user.id });
    if (!response.success) {
      redirect("/login");
    }
    return (
      <UpdateCompanyContactInformationsForm
        contact={response.entrepriseContact}
      />
    );
  } else {
    redirect("/account");
  }
}
