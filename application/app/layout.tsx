import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "react-hot-toast";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const Switzer = localFont({
  src: "../font/Ranade-Regular.otf",
});

export const metadata: Metadata = {
  title: "StagesInfo",
  description: "Aide les élèves du CFPT à trouver des stages",
  icons: {
    icon: "/logo/icon.png",
  },
};

export default async function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="fr">
      <body
        className={`${Switzer.className} flex min-h-screen w-screen flex-col items-center overflow-x-hidden bg-[#f9f9f7] antialiased`}
      >
        <Toaster position="top-right" reverseOrder={false} />
        <LayoutWrapper session={session}>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
