import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "react-hot-toast";

// If loading a variable font, you don't need to specify the font weight
const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StagesInfo",
  description: "Aide les élèves du CFPT à trouver des stages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${poppins.className} flex min-h-screen w-screen flex-col items-center overflow-x-hidden bg-[#f7ead8] antialiased`}
      >
        <Toaster position="top-right" reverseOrder={false} />
        <LayoutWrapper session={null}>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
