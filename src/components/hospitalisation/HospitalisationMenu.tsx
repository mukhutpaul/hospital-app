"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BedDouble,
  Building2,
  ClipboardList,
  DoorOpen,
  HeartPulse,
  LayoutDashboard,
  RefreshCcw,
  Stethoscope,
} from "lucide-react";

const items = [
  { href: "/hospitalisation", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/hospitalisation/hospitalisations", label: "Hospitalisations", icon: ClipboardList },
  { href: "/hospitalisation/chambres", label: "Chambres", icon: Building2 },
  { href: "/hospitalisation/lits", label: "Lits", icon: BedDouble },
  { href: "/hospitalisation/soins", label: "Soins", icon: HeartPulse },
  { href: "/hospitalisation/transferts", label: "Transferts", icon: RefreshCcw },
  { href: "/hospitalisation/sorties", label: "Sorties", icon: DoorOpen },
];

export default function HospitalisationMenu() {
  const pathname = usePathname();

  return (
    <nav aria-label="Hospitalisation" className="space-y-1">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-content"
                : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
            }`}
          >
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
