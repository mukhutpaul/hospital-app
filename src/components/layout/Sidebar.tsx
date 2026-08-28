"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  UserPlus,
  Stethoscope,
  Bed,
  FlaskConical,
  ScanLine,
  Pill,
  Receipt,
  CreditCard,
  ShieldCheck,
  Settings,
  Building2,
  UserCog,
  ClipboardList,
  Building,
  BriefcaseBusiness,
  HeartPulse,
} from "lucide-react";

const menus = [
  {
    title: "TABLEAU DE BORD",
    items: [
      {
        label: "Tableau de bord",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: "PATIENTS",
    items: [
      {
        label: "Patients",
        href: "/patients",
        icon: Users,
      },
      {
        label: "Rendez-vous",
        href: "/rendez-vous",
        icon: CalendarDays,
      },
      {
        label: "Admissions",
        href: "/admissions",
        icon: UserPlus,
      },
    ],
  },

  {
    title: "MÉDICAL",
    items: [
      {
        label: "Consultations",
        href: "/consultations",
        icon: Stethoscope,
      },
       {
        label: "Actes Médicaux",
        href: "/actes",
        icon: Stethoscope,
      },
      {
        label: "Hospitalisations",
        href: "/hospitalisation",
        icon: Bed,
      },
      {
        label: "Laboratoire",
        href: "/laboratoire",
        icon: FlaskConical,
      },
      {
        label: "Imagerie",
        href: "/imagerie",
        icon: ScanLine,
      },
      {
        label: "Pharmacie",
        href: "/pharmacie",
        icon: Pill,
      },
    ],
  },

  {
  title: "PERSONNEL",
  items: [
    {
      label: "Médecins",
      href: "/personnel/medecins",
      icon: Stethoscope,
    },
    {
      label: "Infirmiers",
      href: "/personnel/infirmiers",
      icon: HeartPulse,
    },
    {
      label: "Employés",
      href: "/personnel/employes",
      icon: BriefcaseBusiness,
    },
  ],
},

  {
    title: "GESTION",
    items: [
      {
        label: "Facturation",
        href: "/facturation",
        icon: Receipt,
      },
      {
        label: "Paiements",
        href: "/paiements",
        icon: CreditCard,
      },
    ],
  },

{
  title: "ADMINISTRATION",
  items: [
    {
      label: "Utilisateurs",
      href: "/utilisateurs",
      icon: UserCog,
    },
    {
      label: "Rôles & permissions",
      href: "/roles",
      icon: ShieldCheck,
    },
    {
      label: "Départements",
      href: "/departements",
      icon: Building,
    },
    {
      label: "Services",
      href: "/services",
      icon: Building2,
    },
    {
      label: "Paramètres",
      href: "/administration/parametres",
      icon: Settings,
    },
  ],
},
];

export default function Sidebar() {
  const pathname = usePathname();

  /**
   * Détermine si une route est active.
   *
   * Exemple :
   * /patients           → Patients actif
   * /patients/123       → Patients actif
   * /patients/123/edit  → Patients actif
   *
   * Mais :
   * /paiements ne doit pas activer /patients
   */
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className="
        hidden lg:flex
        w-72
        shrink-0
        flex-col
        bg-base-100
        border-r border-base-300
        h-screen
        sticky top-0
      "
    >
      {/* =====================================================
          LOGO
      ===================================================== */}

      <div className="h-16 shrink-0 border-b border-base-300 px-5">
        <Link
          href="/dashboard"
          className="
            flex
            items-center
            gap-3
            h-full
            rounded-lg
            transition-colors
            hover:bg-base-200
            px-2
          "
        >
          {/* LOGO */}

          <div className="avatar placeholder shrink-0">
            <div
              className="
                bg-primary
                text-primary-content
                rounded-xl
                w-10
                h-10
                flex
                items-center
                justify-center
              "
            >
              <span className="text-lg font-bold">
                H
              </span>
            </div>
          </div>

          {/* NOM */}

          <div className="min-w-0">
            <h1 className="font-bold text-base leading-tight truncate">
              Hospital
            </h1>

            <p className="text-xs text-base-content/60 truncate">
              Management System
            </p>
          </div>
        </Link>
      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav
        className="
          flex-1
          overflow-y-auto
          overflow-x-hidden
          px-4
          py-5
          scrollbar-thin
        "
      >
        {menus.map((section) => (
          <div
            key={section.title}
            className="mb-7 last:mb-0"
          >
            {/* TITRE */}

            <p
              className="
                px-3
                mb-2
                text-[10px]
                font-bold
                tracking-[0.12em]
                text-base-content/45
              "
            >
              {section.title}
            </p>

            {/* ITEMS */}

            <ul className="menu menu-sm p-0 gap-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`
                        min-h-10
                        rounded-lg
                        gap-3
                        px-3
                        transition-all
                        duration-200
                        ${
                          active
                            ? `
                              bg-primary
                              text-primary-content
                              font-semibold
                              shadow-sm
                            `
                            : `
                              text-base-content/75
                              hover:bg-base-200
                              hover:text-base-content
                            `
                        }
                      `}
                    >
                      <Icon
                        size={18}
                        strokeWidth={active ? 2.5 : 2}
                        className="shrink-0"
                      />

                      <span className="truncate">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="shrink-0 border-t border-base-300 p-4">
        <div
          className="
            flex
            items-center
            gap-2
            px-2
            text-xs
            text-base-content/50
          "
        >
          <ClipboardList size={15} />

          <span>
            HMS v1.0.0
          </span>
        </div>
      </div>
    </aside>
  );
}