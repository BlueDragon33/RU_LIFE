"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ruLifeModules } from "@/lib/content-catalog";

export default function WorkspaceNavigation() {
  const pathname = usePathname();
  return <nav className="workspace-nav" aria-label="Điều hướng Hòa nhập Nga">
    <Link className={pathname === "/app" ? "active" : ""} href="/app"><span>00</span>Tổng quan</Link>
    {ruLifeModules.map((module) => {
      const href = `/app/${module.slug}`;
      const active = pathname === href || pathname.startsWith(`${href}/`);
      return <Link className={active ? "active" : ""} href={href} key={module.slug}><span>{module.code}</span>{module.shortTitle}</Link>;
    })}
  </nav>;
}
