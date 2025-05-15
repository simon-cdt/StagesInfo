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

  if (!session || session.user.role !== "student") {
    redirect("/");
  }

  const menuDashBoard = [
    {
      name: "Mes candidatures",
      url: "page.svg",
      path: "/student",
    },
    {
      name: "Mes évaluations",
      url: "star.svg",
      path: "/student/evaluation",
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
