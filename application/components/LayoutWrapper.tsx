"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Navbar from "./Navbar";

export default function LayoutWrapper({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const queryClient = new QueryClient();
  const pathname = usePathname();

  const pathnameAuth = [
    "/login",
    "/register",
    "/register/student",
    "/register/company",
  ];

  if (pathnameAuth.includes(pathname)) {
    return (
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <Navbar />
          {children}
        </NuqsAdapter>
      </QueryClientProvider>
    </SessionProvider>
  );
}
