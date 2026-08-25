"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Boxes,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  Pill,
  RefreshCcw,
} from "lucide-react";

const menu = [
  {
    label: "Tableau de bord",
    href: "/pharmacie",
    icon: LayoutDashboard,
  },

  {
    label: "Médicaments",
    href: "/pharmacie/medicaments",
    icon: Pill,
  },

  {
    label: "Stocks",
    href: "/pharmacie/stocks",
    icon: Boxes,
  },

  {
    label: "Mouvements",
    href: "/pharmacie/mouvements",
    icon: RefreshCcw,
  },

  {
    label: "Ordonnances",
    href: "/pharmacie/ordonnances",
    icon: FileText,
  },

  {
    label: "Dispensation",
    href: "/pharmacie/dispensation",
    icon: ClipboardList,
  },

  {
    label: "Inventaire",
    href: "/pharmacie/inventaire",
    icon: Package,
  },
];

export default function PharmacieSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-base-300 bg-base-100">
      <div className="p-4">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-content">
            <Pill size={21} />
          </div>

          <div>
            <h2 className="font-bold">
              Pharmacie
            </h2>

            <p className="text-xs text-base-content/50">
              Gestion pharmaceutique
            </p>
          </div>
        </div>

        <ul className="menu gap-1 p-0">
          {menu.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/pharmacie"
                ? pathname ===
                  "/pharmacie"
                : pathname.startsWith(
                    item.href
                  );

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    active
                      ? "active font-semibold"
                      : ""
                  }
                >
                  <Icon
                    size={18}
                  />

                  <span>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}