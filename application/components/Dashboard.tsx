"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Dashboard({
  menu,
}: {
  menu: { name: string; url: string; path: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex w-60 flex-col gap-2 pt-10">
      {menu.map((link, index) => {
        {
          const isActive = pathname === link.path;
          return (
            <Link href={link.path} key={index}>
              <div
                className={`best-transition hover:bg-opacity-50 pointer flex items-center justify-center gap-2 rounded-md p-2 text-sm font-bold hover:bg-gray-200 lg:justify-start ${
                  isActive && "bg-gray-300 hover:bg-gray-300"
                }`}
              >
                <Image
                  src={`/icon/${link.url}`}
                  alt="Icone"
                  width={500}
                  height={500}
                  className="w-6"
                />
                <span className="hidden lg:block">{link.name}</span>
              </div>
            </Link>
          );
        }
      })}
    </nav>
  );
}
