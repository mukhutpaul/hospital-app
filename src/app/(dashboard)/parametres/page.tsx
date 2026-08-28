import {
Activity,
BedDouble,
Building2,
ClipboardList,
FlaskConical,
Image,
KeyRound,
LayoutGrid,
ShieldCheck,
Stethoscope,
Users,
} from "lucide-react";

import Link from "next/link";

const parametres = [
{
title: "Structure hospitalière",
description:
"Configurez l'organisation et les services de l'hôpital.",
icon: Building2,
color: "text-primary",
bg: "bg-primary/10",
items: [
{
label: "Départements",
href: "/departements",
},
{
label: "Services",
href: "/services",
},
{
label: "Spécialités",
href: "/specialites",
},
],
},

{
title: "Hospitalisation",
description:
"Configurez les chambres et les lits disponibles.",
icon: BedDouble,
color: "text-secondary",
bg: "bg-secondary/10",
items: [
{
label: "Chambres",
href: "/chambres",
},
{
label: "Lits",
href: "/lits",
},
],
},

{
title: "Utilisateurs et sécurité",
description:
"Gérez les utilisateurs, rôles et permissions.",
icon: ShieldCheck,
color: "text-success",
bg: "bg-success/10",
items: [
{
label: "Utilisateurs",
href: "/utilisateurs",
},
{
label: "Rôles",
href: "/roles",
},
{
label: "Permissions",
href: "/permissions",
},
],
},

{
title: "Personnel médical",
description:
"Gérez les informations du personnel hospitalier.",
icon: Users,
color: "text-info",
bg: "bg-info/10",
items: [
{
label: "Employés",
href: "/employes",
},
{
label: "Médecins",
href: "/medecins",
},
{
label: "Infirmiers",
href: "/infirmiers",
},
],
},

{
title: "Tarification médicale",
description:
"Configurez les actes médicaux et leurs tarifs.",
icon: ClipboardList,
color: "text-warning",
bg: "bg-warning/10",
items: [
{
label: "Actes médicaux",
href: "/actes-medicaux",
},
],
},

{
title: "Laboratoire",
description:
"Configurez les examens et les tarifs du laboratoire.",
icon: FlaskConical,
color: "text-error",
bg: "bg-error/10",
items: [
{
label: "Examens laboratoire",
href: "/examens-laboratoire",
},
],
},

{
title: "Imagerie médicale",
description:
"Configurez les examens d'imagerie.",
icon: Image,
color: "text-accent",
bg: "bg-accent/10",
items: [
{
label: "Examens imagerie",
href: "/examens-imagerie",
},
],
},

{
title: "Système",
description:
"Consultez les paramètres techniques et activités.",
icon: KeyRound,
color: "text-neutral",
bg: "bg-base-200",
items: [
{
label: "Journal d'activité",
href: "/audit-logs",
},
],
},
];

export default function ParametresPage() {
return ( <div className="space-y-8">


  {/* HEADER */}

  <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm lg:p-8">

    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

      <div className="flex items-center gap-4">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg">

          <LayoutGrid size={28} />

        </div>

        <div>

          <h1 className="text-2xl font-bold lg:text-3xl">

            Paramètres

          </h1>

          <p className="mt-1 text-sm text-base-content/60">

            Configurez et gérez les différents éléments du système hospitalier.

          </p>

        </div>

      </div>

      <div className="badge badge-primary badge-outline gap-2 p-4">

        <Activity size={16} />

        Configuration système

      </div>

    </div>

  </div>

  {/* INTRO */}

  <div>

    <h2 className="text-xl font-bold">

      Configuration de l'hôpital

    </h2>

    <p className="mt-1 text-sm text-base-content/60">

      Sélectionnez une catégorie pour accéder aux paramètres correspondants.

    </p>

  </div>

  {/* GRID */}

  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

    {parametres.map((categorie) => {

      const Icon = categorie.icon;

      return (

        <div
          key={categorie.title}
          className="group rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >

          {/* ICON */}

          <div
            className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${categorie.bg} ${categorie.color}`}
          >

            <Icon size={26} />

          </div>

          {/* TITLE */}

          <h3 className="text-lg font-bold">

            {categorie.title}

          </h3>

          {/* DESCRIPTION */}

          <p className="mt-2 min-h-12 text-sm leading-6 text-base-content/60">

            {categorie.description}

          </p>

          {/* LINKS */}

          <div className="mt-6 space-y-2 border-t border-base-200 pt-4">

            {categorie.items.map((item) => (

              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-base-200"
              >

                <span>

                  {item.label}

                </span>

                <span className="text-primary">

                  →

                </span>

              </Link>

            ))}

          </div>

        </div>

      );

    })}

  </div>

</div>

);
}
