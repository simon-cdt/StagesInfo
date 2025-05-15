import Dashboard from "@/components/Dashboard";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function CompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const menuDashBoard = [];
  if (session.user.role === "student") {
    menuDashBoard.push(
      {
        name: "Mes informations",
        url: "info-circle.svg",
        path: "/account",
      },
      {
        name: "Changer mot de passe",
        url: "lock.svg",
        path: "/account/password",
      },
    );
  } else if (session.user.role === "company") {
    menuDashBoard.push(
      {
        name: "Informations de l'entreprise",
        url: "info-circle.svg",
        path: "/account",
      },
      {
        name: "Informations du contact",
        url: "user.svg",
        path: "/account/company-contact",
      },
      {
        name: "Changer mot de passe",
        url: "lock.svg",
        path: "/account/password",
      },
    );
  } else if (session.user.role === "admin") {
    menuDashBoard.push({
      name: "Changer mon mot de passe",
      url: "lock.svg",
      path: "/account/password",
    });
  }

  return (
    <section className="flex w-full max-w-[1100px] items-start gap-4">
      <div className="h-full">
        <Dashboard menu={menuDashBoard} />
      </div>
      <div className="h-full w-full">{children}</div>
    </section>
  );
}
