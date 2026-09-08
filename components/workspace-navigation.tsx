"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ruLifeModules } from "@/lib/content-catalog";

const moduleIcon: Record<string, string> = {
  prepare: "✈",
  "daily-life": "⌂",
  "study-procedures": "▤",
  health: "♥",
  integration: "文",
};

export default function WorkspaceNavigation() {
  const pathname = usePathname();
  return <nav className="workspace-nav" aria-label="Điều hướng Hòa nhập Nga">
    <Link className={pathname === "/app" ? "active" : ""} href="/app"><span aria-hidden="true">⌂</span>Tổng quan<small>00</small></Link>
    {ruLifeModules.map((module) => {
      const href = `/app/${module.slug}`;
      const active = pathname === href || pathname.startsWith(`${href}/`);
      return <Link className={active ? "active" : ""} href={href} key={module.slug}><span aria-hidden="true">{moduleIcon[module.slug] || "•"}</span>{module.shortTitle}<small>{module.code}</small></Link>;
    })}
  </nav>;
}
