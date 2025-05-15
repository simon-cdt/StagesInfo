import UpdateCompanyInformationsForm from "@/components/form/UpdateAccount/CompanyInformations";
import UpdateStudentInformationsForm from "@/components/form/UpdateAccount/StudentInformations";
import { getEntrepriseSession } from "@/lib/actions/company";
import { getStudentSession } from "@/lib/actions/student";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role) {
    redirect("/login");
  }

  if (session.user.role === "student") {
    const response = await getStudentSession({ id: session.user.id });
    if (!response.success) {
      redirect("/");
    }
    return <UpdateStudentInformationsForm student={response.student} />;
  } else if (session.user.role === "company") {
    const response = await getEntrepriseSession({ id: session.user.id });
    if (!response.success) {
      redirect("/login");
    }
    return (
      <UpdateCompanyInformationsForm
        company={response.company}
        sectors={response.sectors}
      />
    );
  } else if (session.user.role === "admin") {
    redirect("/account/password");
  }

  redirect("/");
}
