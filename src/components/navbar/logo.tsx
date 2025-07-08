"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const Logo = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <Link href="/">
      <div className="flex items-center gap-x-2 hover:opacity-75 transition-all duration-200 group">
        <div className="relative p-1 shrink-0">
          <Image
            src="/logo.png"
            alt="Learnify Logo"
            width={120}
            height={40}
            className={cn(
              "transition-transform duration-200",
              "group-hover:scale-105",
              isHome && "animate-pulse"
            )}
            priority
          />      
        </div>
      </div>
    </Link>
  );
};