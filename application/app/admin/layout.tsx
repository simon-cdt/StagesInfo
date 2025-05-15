import Dashboard from "@/components/Dashboard";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const menuDashBoard = [
    {
      name: "Les utilisateurs",
      url: "user.svg",
      path: "/admin",
    },
    {
      name: "Les entreprises",
      url: "building.svg",
      path: "/admin/companies",
    },
    {
      name: "Les offres",
      url: "multiple-pages.svg",
      path: "/admin/offers",
    },
    {
      name: "Les candidatures",
      url: "page.svg",
      path: "/admin/submissions",
    },
    {
      name: "Les évaluations",
      url: "star.svg",
      path: "/admin/evaluations",
    },
  ];

  return (
    <section className="flex w-full max-w-[1800px] items-start gap-4">
      <div className="h-full">
        <Dashboard menu={menuDashBoard} />
      </div>
      <div className="h-full w-full">{children}</div>
    </section>
  );
}
