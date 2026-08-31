
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

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

/* ==========================================================
   TYPES
========================================================== */

type Role =
  | "ADMIN"
  | "MEDECIN"
  | "INFIRMIER"
  | "RECEPTIONNISTE"
  | "LABORANTIN"
  | "RADIOLOGUE"
  | "PHARMACIEN"
  | "COMPTABLE"
  | "CAISSIER"
  | "SECRETAIRE";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

/* ==========================================================
   MENUS
========================================================== */

const menus: MenuSection[] = [

  /* ========================================================
     TABLEAU DE BORD
  ======================================================== */

  {
    title: "TABLEAU DE BORD",

    items: [
      {
        label: "Tableau de bord",
        href: "/dashboard",
        icon: LayoutDashboard,

        roles: [
          "ADMIN",
          "MEDECIN",
          "INFIRMIER",
          "RECEPTIONNISTE",
          "LABORANTIN",
          "RADIOLOGUE",
          "PHARMACIEN",
          "COMPTABLE",
          "CAISSIER",
          "SECRETAIRE",
        ],
      },
    ],
  },

  /* ========================================================
     PATIENTS
  ======================================================== */

  {
    title: "PATIENTS",

    items: [
      {
        label: "Patients",
        href: "/patients",
        icon: Users,

        roles: [
          "ADMIN",
          "MEDECIN",
          "INFIRMIER",
          "RECEPTIONNISTE",
          "LABORANTIN",
          "RADIOLOGUE",
          "PHARMACIEN",
          "COMPTABLE",
          "CAISSIER",
        ],
      },

      {
        label: "Rendez-vous",
        href: "/rendez-vous",
        icon: CalendarDays,

        roles: [
          "ADMIN",
          "RECEPTIONNISTE",
          "SECRETAIRE",
        ],
      },

      {
        label: "Admissions",
        href: "/admissions",
        icon: UserPlus,

        roles: [
          "ADMIN",
          "RECEPTIONNISTE",
          "INFIRMIER",
        ],
      },

      {
        label: "Triage",
        href: "/triages",
        icon: HeartPulse,

        roles: [
          "ADMIN",
          "INFIRMIER",
        ],
      },
    ],
  },

  /* ========================================================
     MÉDICAL
  ======================================================== */

  {
    title: "MÉDICAL",

    items: [
      {
        label: "Consultations",
        href: "/consultations",
        icon: Stethoscope,

        roles: [
          "ADMIN",
          "MEDECIN",
        ],
      },

      {
        label: "Actes médicaux",
        href: "/actes",
        icon: Stethoscope,

        roles: [
          "ADMIN",
          "MEDECIN",
          "INFIRMIER",
        ],
      },

      {
        label: "Hospitalisations",
        href: "/hospitalisation",
        icon: Bed,

        roles: [
          "ADMIN",
          "MEDECIN",
          "INFIRMIER",
        ],
      },

      {
        label: "Laboratoire",
        href: "/laboratoire",
        icon: FlaskConical,

        roles: [
          "ADMIN",
          "LABORANTIN",
        ],
      },

      {
        label: "Imagerie",
        href: "/imagerie",
        icon: ScanLine,

        roles: [
          "ADMIN",
          "RADIOLOGUE",
        ],
      },

      {
        label: "Pharmacie",
        href: "/pharmacie",
        icon: Pill,

        roles: [
          "ADMIN",
          "PHARMACIEN",
        ],
      },
    ],
  },

  /* ========================================================
     PERSONNEL
  ======================================================== */

  {
    title: "PERSONNEL",

    items: [
      {
        label: "Médecins",
        href: "/personnel/medecins",
        icon: Stethoscope,

        roles: [
          "ADMIN",
        ],
      },

      {
        label: "Infirmiers",
        href: "/personnel/infirmiers",
        icon: HeartPulse,

        roles: [
          "ADMIN",
        ],
      },

      {
        label: "Employés",
        href: "/personnel/employes",
        icon: BriefcaseBusiness,

        roles: [
          "ADMIN",
        ],
      },
    ],
  },

  /* ========================================================
     GESTION FINANCIÈRE
  ======================================================== */

  {
    title: "GESTION FINANCIÈRE",

    items: [

      /* ------------------------------------------------------
         FACTURATION
      ------------------------------------------------------ */

      {
        label: "Facturation",
        href: "/facturation",
        icon: Receipt,

        roles: [
          "ADMIN",
          "COMPTABLE",
          "CAISSIER",
        ],
      },

      /* ------------------------------------------------------
         PAIEMENTS
      ------------------------------------------------------ */

      {
        label: "Paiements",
        href: "/paiements",
        icon: CreditCard,

        roles: [
          "ADMIN",
          "COMPTABLE",
          "CAISSIER",
          "RECEPTIONNISTE",
        ],
      },

      /* ------------------------------------------------------
         RAPPORTS FINANCIERS
      ------------------------------------------------------ */

      {
        label: "Rapports financiers",
        href: "/rapports/financiers",
        icon: ClipboardList,

        roles: [
          "ADMIN",
          "COMPTABLE",
        ],
      },
    ],
  },

  /* ========================================================
     ADMINISTRATION
  ======================================================== */

  {
    title: "ADMINISTRATION",

    items: [
      {
        label: "Utilisateurs",
        href: "/utilisateurs",
        icon: UserCog,

        roles: [
          "ADMIN",
        ],
      },

      {
        label: "Rôles & permissions",
        href: "/roles",
        icon: ShieldCheck,

        roles: [
          "ADMIN",
        ],
      },

      {
        label: "Départements",
        href: "/departements",
        icon: Building,

        roles: [
          "ADMIN",
        ],
      },

      {
        label: "Services",
        href: "/services",
        icon: Building2,

        roles: [
          "ADMIN",
        ],
      },

      {
        label: "Spécialités",
        href: "/specialites",
        icon: Building2,

        roles: [
          "ADMIN",
        ],
      },

      {
        label: "Rapports",
        href: "/rapports",
        icon: ClipboardList,

        roles: [
          "ADMIN",
          "COMPTABLE",
        ],
      },

      {
        label: "Paramètres",
        href: "/parametres",
        icon: Settings,

        roles: [
          "ADMIN",
        ],
      },

      {
        label: "Journal d'activités",
        href: "/audit-logs",
        icon: ClipboardList,

        roles: [
          "ADMIN",
        ],
      },
    ],
  },
];

/* ==========================================================
   SIDEBAR
========================================================== */

export default function Sidebar() {
  const pathname = usePathname();

  const { data: session, status } = useSession();

  /* ========================================================
     RÔLE
  ======================================================== */

  const role = session?.user?.role as Role | undefined;

  /* ========================================================
     CHARGEMENT
  ======================================================== */

  if (status === "loading") {
    return (
      <aside
        className="
          hidden lg:flex
          w-72
          shrink-0
          h-screen
          bg-base-100
          border-r
          border-base-300
        "
      />
    );
  }

  /* ========================================================
     UTILISATEUR NON CONNECTÉ
  ======================================================== */

  if (!session?.user) {
    return null;
  }

  /* ========================================================
     VÉRIFICATION DU RÔLE
  ======================================================== */

  const hasRole = (allowedRoles: Role[]) => {
    if (!role) {
      return false;
    }

    /*
     * L'administrateur possède accès
     * à tous les menus.
     */

    if (role === "ADMIN") {
      return true;
    }

    return allowedRoles.includes(role);
  };

  /* ========================================================
     ROUTE ACTIVE
  ======================================================== */

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <aside
      className="
        hidden lg:flex
        w-72
        shrink-0
        flex-col
        bg-base-100
        border-r
        border-base-300
        h-screen
        sticky top-0
      "
    >

      {/* ====================================================
          LOGO
      ==================================================== */}

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

      {/* ====================================================
          NAVIGATION
      ==================================================== */}

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

        {menus.map((section) => {

          /*
           * Filtrer les éléments selon le rôle.
           */

          const visibleItems =
            section.items.filter((item) =>
              hasRole(item.roles),
            );

          /*
           * Ne pas afficher une section vide.
           */

          if (visibleItems.length === 0) {
            return null;
          }

          return (
            <div
              key={section.title}
              className="mb-7 last:mb-0"
            >

              {/* TITRE SECTION */}

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

                {visibleItems.map((item) => {

                  const Icon = item.icon;

                  const active =
                    isActive(item.href);

                  return (
                    <li key={item.href}>

                      <Link
                        href={item.href}
                        aria-current={
                          active
                            ? "page"
                            : undefined
                        }
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
                          strokeWidth={
                            active ? 2.5 : 2
                          }
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
          );
        })}

      </nav>

      {/* ====================================================
          FOOTER
      ==================================================== */}

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
