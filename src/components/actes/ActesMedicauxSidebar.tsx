
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardList,
  PlusCircle,
  Stethoscope,
  ArrowLeft,
} from "lucide-react";

const items = [
  {
    label: "Tous les actes",
    href: "/actes",
    icon: Activity,
  },
  {
    label: "Nouvel acte",
    href: "/actes/nouveau",
    icon: PlusCircle,
  },
  {
    label: "Actes de consultation",
    href: "/actes/consultations",
    icon: ClipboardList,
  },
];

export default function ActesMedicauxSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body p-3">
          <div className="mb-3 flex items-center gap-3 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Stethoscope size={22} />
            </div>

            <div>
              <p className="font-bold">
                Actes médicaux
              </p>

              <p className="text-xs opacity-60">
                Gestion du module
              </p>
            </div>
          </div>

          <div className="divider my-1" />

          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                (item.href !==
                  "/actes/actes" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-primary text-primary-content shadow-sm"
                      : "hover:bg-base-200"
                  }`}
                >
                  <Icon size={18} />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="divider my-2" />

          <Link
            href="/facturation"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-base-200"
          >
            <ArrowLeft size={18} />

            <span>Retour à la facturation</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
