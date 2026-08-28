"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
Eye,
MoreHorizontal,
Stethoscope,
Trash2,
Search,
Filter,
RotateCcw,
ClipboardList,
Clock3,
CheckCircle2,
XCircle,
Hospital,
ChevronLeft,
ChevronRight,
CalendarDays,
UserRound,
Building2,
Activity,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
deleteAdmission,
updateAdmissionStatut,
} from "@/app/actions/admission";

/* ==========================================================
TYPES
========================================================== */

type Admission = {
id: number;

numero: string;

type: string;
motif: string | null;
statut: string;

dateAdmission: Date | string;

patient: {
id: number;
numeroDossier: string;
nom: string;
postNom: string | null;
prenom: string | null;
};

service: {
id: number;
nom: string;
} | null;

rendezVous: {
id: number;
numero: string;
} | null;

triage: unknown;
consultation: unknown;
hospitalisation: unknown;
};

type Props = {
admissions: Admission[];
};

const ELEMENTS_PAR_PAGE = 10;

/* ==========================================================
HELPERS
========================================================== */

function getStatutClass(statut: string) {
switch (statut) {
case "EN_ATTENTE":
return "badge-warning";


case "TRIE":
  return "badge-info";

case "EN_CONSULTATION":
  return "badge-primary";

case "HOSPITALISE":
  return "badge-secondary";

case "TERMINEE":
  return "badge-success";

case "ANNULEE":
  return "badge-error";

default:
  return "badge-ghost";


}
}

function getStatutLabel(statut: string) {
switch (statut) {
case "EN_ATTENTE":
return "En attente";


case "TRIE":
  return "Trié";

case "EN_CONSULTATION":
  return "En consultation";

case "HOSPITALISE":
  return "Hospitalisé";

case "TERMINEE":
  return "Terminée";

case "ANNULEE":
  return "Annulée";

default:
  return statut;


}
}

function getTypeLabel(type: string) {
switch (type) {
case "PROGRAMMEE":
return "Programmée";


case "URGENCE":
  return "Urgence";

case "AMBULATOIRE":
  return "Ambulatoire";

default:
  return type;


}
}

function getNomComplet(admission: Admission) {
return [
admission.patient.nom,
admission.patient.postNom,
admission.patient.prenom,
]
.filter(Boolean)
.join(" ");
}

/* ==========================================================
COMPONENT
========================================================== */

export default function AdmissionTable({
admissions,
}: Props) {
/* ========================================================
STATES
======================================================== */

const [search, setSearch] = useState("");

const [statut, setStatut] =
useState("TOUS");

const [type, setType] =
useState("TOUS");

const [service, setService] =
useState("TOUS");

const [dateDebut, setDateDebut] =
useState("");

const [dateFin, setDateFin] =
useState("");

const [page, setPage] =
useState(1);

const [loadingId, setLoadingId] =
useState<number | null>(null);

/* ========================================================
SERVICES DISPONIBLES
======================================================== */

const services = useMemo(() => {
const liste = admissions
.map((admission) =>
admission.service?.nom,
)
.filter(Boolean);


return Array.from(
  new Set(liste),
);


}, [admissions]);

/* ========================================================
STATISTIQUES
======================================================== */

const statistiques = useMemo(() => {
return {
total: admissions.length,


  attente: admissions.filter(
    (item) =>
      item.statut === "EN_ATTENTE",
  ).length,

  consultation: admissions.filter(
    (item) =>
      item.statut ===
      "EN_CONSULTATION",
  ).length,

  hospitalise: admissions.filter(
    (item) =>
      item.statut === "HOSPITALISE",
  ).length,

  terminee: admissions.filter(
    (item) =>
      item.statut === "TERMINEE",
  ).length,
};


}, [admissions]);

/* ========================================================
FILTRAGE
======================================================== */

const admissionsFiltrees =
useMemo(() => {
const terme =
search.trim().toLowerCase();


  return admissions.filter(
    (admission) => {
      const nomComplet =
        getNomComplet(
          admission,
        ).toLowerCase();

      const correspondRecherche =
        !terme ||
        admission.numero
          .toLowerCase()
          .includes(terme) ||
        admission.patient.numeroDossier
          .toLowerCase()
          .includes(terme) ||
        nomComplet.includes(terme) ||
        (
          admission.service?.nom ||
          ""
        )
          .toLowerCase()
          .includes(terme) ||
        (
          admission.motif ||
          ""
        )
          .toLowerCase()
          .includes(terme) ||
        (
          admission.rendezVous?.numero ||
          ""
        )
          .toLowerCase()
          .includes(terme);

      const correspondStatut =
        statut === "TOUS" ||
        admission.statut === statut;

      const correspondType =
        type === "TOUS" ||
        admission.type === type;

      const correspondService =
        service === "TOUS" ||
        admission.service?.nom === service;

      const dateAdmission =
        new Date(
          admission.dateAdmission,
        );

      const correspondDateDebut =
        !dateDebut ||
        dateAdmission >=
          new Date(dateDebut);

      const dateFinComplete =
        dateFin
          ? new Date(
              `${dateFin}T23:59:59`,
            )
          : null;

      const correspondDateFin =
        !dateFinComplete ||
        dateAdmission <=
          dateFinComplete;

      return (
        correspondRecherche &&
        correspondStatut &&
        correspondType &&
        correspondService &&
        correspondDateDebut &&
        correspondDateFin
      );
    },
  );
}, [
  admissions,
  search,
  statut,
  type,
  service,
  dateDebut,
  dateFin,
]);


/* ========================================================
PAGINATION
======================================================== */

const totalPages = Math.max(
1,
Math.ceil(
admissionsFiltrees.length /
ELEMENTS_PAR_PAGE,
),
);

const pageActuelle =
Math.min(
page,
totalPages,
);

const admissionsPage =
admissionsFiltrees.slice(
(pageActuelle - 1) *
ELEMENTS_PAR_PAGE,
pageActuelle *
ELEMENTS_PAR_PAGE,
);

/* ========================================================
RESET FILTRES
======================================================== */

function resetFilters() {
setSearch("");
setStatut("TOUS");
setType("TOUS");
setService("TOUS");
setDateDebut("");
setDateFin("");
setPage(1);
}

const hasFilters =
search ||
statut !== "TOUS" ||
type !== "TOUS" ||
service !== "TOUS" ||
dateDebut ||
dateFin;

/* ========================================================
DELETE
======================================================== */

async function handleDelete(
admission: Admission,
) {
const result =
await Swal.fire({
title:
"Supprimer cette admission ?",


    html: `
      <div class="text-sm">
        Vous êtes sur le point de supprimer
        l'admission
        <strong>${admission.numero}</strong>.
        <br/><br/>
        Cette action est irréversible.
      </div>
    `,

    icon: "warning",

    showCancelButton: true,

    confirmButtonText:
      "Oui, supprimer",

    cancelButtonText:
      "Annuler",

    confirmButtonColor:
      "#d33",

    reverseButtons: true,
  });

if (!result.isConfirmed) {
  return;
}

try {
  setLoadingId(admission.id);

  const response =
    await deleteAdmission(
      admission.id,
    );

  if (response.success) {
    toast.success(
      response.message,
    );

    window.location.reload();
  } else {
    toast.error(
      response.message,
    );
  }
} catch (error) {
  console.error(error);

  toast.error(
    "Une erreur est survenue lors de la suppression.",
  );
} finally {
  setLoadingId(null);
}


}

/* ========================================================
UPDATE STATUT
======================================================== */

async function handleStatut(
admission: Admission,
nouveauStatut: string,
) {
try {
setLoadingId(admission.id);


  const response =
    await updateAdmissionStatut(
      admission.id,
      nouveauStatut,
    );

  if (response.success) {
    toast.success(
      response.message,
    );

    window.location.reload();
  } else {
    toast.error(
      response.message,
    );
  }
} catch (error) {
  console.error(error);

  toast.error(
    "Impossible de modifier le statut.",
  );
} finally {
  setLoadingId(null);
}


}

/* ========================================================
EMPTY GLOBAL
======================================================== */

if (!admissions.length) {
return ( <div className="rounded-2xl border border-base-200 bg-base-100 shadow-sm"> <div className="flex flex-col items-center justify-center py-20 text-center">


      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ClipboardList size={36} />
      </div>

      <h3 className="text-xl font-bold">
        Aucune admission
      </h3>

      <p className="mt-2 max-w-md text-sm text-base-content/60">
        Aucune admission n'a encore été enregistrée dans le système.
      </p>

    </div>
  </div>
);


}

/* ========================================================
RENDER
======================================================== */

return ( <div className="space-y-6">


  {/* ====================================================
      STATISTIQUES
  ==================================================== */}

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

    <StatCard
      label="Total admissions"
      value={statistiques.total}
      icon={<ClipboardList size={24} />}
      color="primary"
    />

    <StatCard
      label="En attente"
      value={statistiques.attente}
      icon={<Clock3 size={24} />}
      color="warning"
    />

    <StatCard
      label="Consultations"
      value={statistiques.consultation}
      icon={<Stethoscope size={24} />}
      color="info"
    />

    <StatCard
      label="Hospitalisés"
      value={statistiques.hospitalise}
      icon={<Hospital size={24} />}
      color="secondary"
    />

    <StatCard
      label="Terminées"
      value={statistiques.terminee}
      icon={<CheckCircle2 size={24} />}
      color="success"
    />

  </div>

  {/* ====================================================
      FILTRES
  ==================================================== */}

  <div className="rounded-2xl border border-base-200 bg-base-100 shadow-sm">

    <div className="border-b border-base-200 px-5 py-4">

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-2">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Filter size={19} />
          </div>

          <div>
            <h2 className="font-bold">
              Recherche et filtres
            </h2>

            <p className="text-xs text-base-content/60">
              Affinez la liste des admissions.
            </p>
          </div>

        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="btn btn-sm btn-ghost"
          >
            <RotateCcw size={16} />

            Réinitialiser
          </button>
        )}

      </div>

    </div>

    <div className="p-5">

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">

        {/* RECHERCHE */}

        <label className="input input-bordered flex items-center gap-2 xl:col-span-2">

          <Search
            size={18}
            className="text-base-content/50"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value,
              );

              setPage(1);
            }}
            placeholder="Patient, dossier, admission, motif..."
            className="grow"
          />

        </label>

        {/* STATUT */}

        <select
          className="select select-bordered w-full"
          value={statut}
          onChange={(event) => {
            setStatut(
              event.target.value,
            );

            setPage(1);
          }}
        >

          <option value="TOUS">
            Tous les statuts
          </option>

          <option value="EN_ATTENTE">
            En attente
          </option>

          <option value="TRIE">
            Trié
          </option>

          <option value="EN_CONSULTATION">
            En consultation
          </option>

          <option value="HOSPITALISE">
            Hospitalisé
          </option>

          <option value="TERMINEE">
            Terminée
          </option>

          <option value="ANNULEE">
            Annulée
          </option>

        </select>

        {/* TYPE */}

        <select
          className="select select-bordered w-full"
          value={type}
          onChange={(event) => {
            setType(
              event.target.value,
            );

            setPage(1);
          }}
        >

          <option value="TOUS">
            Tous les types
          </option>

          <option value="PROGRAMMEE">
            Programmée
          </option>

          <option value="URGENCE">
            Urgence
          </option>

          <option value="AMBULATOIRE">
            Ambulatoire
          </option>

        </select>

        {/* SERVICE */}

        <select
          className="select select-bordered w-full"
          value={service}
          onChange={(event) => {
            setService(
              event.target.value,
            );

            setPage(1);
          }}
        >

          <option value="TOUS">
            Tous les services
          </option>

          {services.map(
            (serviceName) => (
              <option
                key={serviceName}
                value={serviceName}
              >
                {serviceName}
              </option>
            ),
          )}

        </select>

        {/* DATE DEBUT */}

        <label className="input input-bordered flex items-center gap-2">

          <CalendarDays
            size={17}
            className="text-base-content/50"
          />

          <input
            type="date"
            value={dateDebut}
            onChange={(event) => {
              setDateDebut(
                event.target.value,
              );

              setPage(1);
            }}
            className="grow"
          />

        </label>

        {/* DATE FIN */}

        <label className="input input-bordered flex items-center gap-2">

          <CalendarDays
            size={17}
            className="text-base-content/50"
          />

          <input
            type="date"
            value={dateFin}
            onChange={(event) => {
              setDateFin(
                event.target.value,
              );

              setPage(1);
            }}
            className="grow"
          />

        </label>

      </div>

    </div>

  </div>

  {/* ====================================================
      RESULTAT
  ==================================================== */}

  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

    <div>

      <h2 className="font-bold">
        Liste des admissions
      </h2>

      <p className="text-sm text-base-content/60">

        {admissionsFiltrees.length} admission
        {admissionsFiltrees.length > 1
          ? "s"
          : ""} trouvée
        {admissionsFiltrees.length > 1
          ? "s"
          : ""}

      </p>

    </div>

    {hasFilters && (
      <span className="badge badge-primary badge-outline">
        Filtres actifs
      </span>
    )}

  </div>

  {/* ====================================================
      TABLE
  ==================================================== */}

  <div className="overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm">

    <div className="overflow-x-auto">

      <table className="table table-zebra">

        <thead>

          <tr>

            <th>Admission</th>

            <th>Patient</th>

            <th>Type</th>

            <th>Service</th>

            <th>Parcours</th>

            <th>Date</th>

            <th>Statut</th>

            <th className="text-right">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {admissionsPage.length === 0 ? (

            <tr>

              <td
                colSpan={8}
                className="py-16 text-center"
              >

                <div className="flex flex-col items-center">

                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-base-200 text-base-content/50">
                    <Search size={30} />
                  </div>

                  <h3 className="font-semibold">
                    Aucun résultat
                  </h3>

                  <p className="mt-1 text-sm text-base-content/60">
                    Aucune admission ne correspond aux filtres sélectionnés.
                  </p>

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="btn btn-sm btn-primary mt-4"
                    >
                      <RotateCcw size={16} />

                      Réinitialiser les filtres
                    </button>
                  )}

                </div>

              </td>

            </tr>

          ) : (

            admissionsPage.map(
              (admission) => {

                const loading =
                  loadingId ===
                  admission.id;

                return (

                  <tr
                    key={admission.id}
                    className="hover:bg-base-200/50"
                  >

                    {/* ADMISSION */}

                    <td>

                      <div className="font-bold">
                        {admission.numero}
                      </div>

                      {admission.rendezVous && (
                        <div className="mt-1 text-xs text-base-content/50">
                          RDV :
                          {" "}
                          {admission.rendezVous.numero}
                        </div>
                      )}

                    </td>

                    {/* PATIENT */}

                    <td>

                      <div className="flex items-center gap-3">

                        <div className="avatar placeholder">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">

                            <UserRound
                              size={18}
                            />

                          </div>

                        </div>

                        <div>

                          <div className="font-semibold whitespace-nowrap">

                            {getNomComplet(
                              admission,
                            )}

                          </div>

                          <div className="text-xs text-base-content/50">

                            {
                              admission.patient
                                .numeroDossier
                            }

                          </div>

                        </div>

                      </div>

                    </td>

                    {/* TYPE */}

                    <td>

                      <span className="badge badge-outline">

                        {getTypeLabel(
                          admission.type,
                        )}

                      </span>

                    </td>

                    {/* SERVICE */}

                    <td>

                      {admission.service ? (

                        <div className="flex items-center gap-2">

                          <Building2
                            size={15}
                            className="text-base-content/50"
                          />

                          <span>

                            {
                              admission.service
                                .nom
                            }

                          </span>

                        </div>

                      ) : (

                        <span className="text-base-content/40">
                          —
                        </span>

                      )}

                    </td>

                    {/* PARCOURS */}

                    <td>

                      <div className="flex flex-wrap gap-1">

                        {admission.triage && (

                          <span className="badge badge-info badge-sm">
                            Trié
                          </span>

                        )}

                        {admission.consultation && (

                          <span className="badge badge-primary badge-sm">
                            Consultation
                          </span>

                        )}

                        {admission.hospitalisation && (

                          <span className="badge badge-secondary badge-sm">
                            Hospitalisé
                          </span>

                        )}

                        {!admission.triage &&
                          !admission.consultation &&
                          !admission.hospitalisation && (

                            <span className="text-xs text-base-content/40">
                              Aucun parcours
                            </span>

                          )}

                      </div>

                    </td>

                    {/* DATE */}

                    <td>

                      <div className="whitespace-nowrap text-sm">

                        {new Date(
                          admission.dateAdmission,
                        ).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}

                      </div>

                      <div className="text-xs text-base-content/50">

                        {new Date(
                          admission.dateAdmission,
                        ).toLocaleTimeString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}

                      </div>

                    </td>

                    {/* STATUT */}

                    <td>

                      <span
                        className={`badge whitespace-nowrap ${getStatutClass(
                          admission.statut,
                        )}`}
                      >

                        {getStatutLabel(
                          admission.statut,
                        )}

                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="flex justify-end">

                        <div className="dropdown dropdown-end">

                          <button
                            type="button"
                            disabled={loading}
                            className="btn btn-sm btn-ghost"
                          >

                            {loading ? (

                              <span className="loading loading-spinner loading-xs" />

                            ) : (

                              <MoreHorizontal
                                size={18}
                              />

                            )}

                          </button>

                          <ul className="dropdown-content menu z-50 mt-2 w-64 rounded-box border border-base-200 bg-base-100 p-2 shadow-xl">

                            <li>

                              <Link
                                href={`/admissions/${admission.id}`}
                              >

                                <Eye size={16} />

                                Voir le détail

                              </Link>

                            </li>

                            {admission.statut ===
                              "EN_ATTENTE" && (

                              <li>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatut(
                                      admission,
                                      "TRIE",
                                    )
                                  }
                                >

                                  <Stethoscope
                                    size={16}
                                  />

                                  Marquer comme trié

                                </button>

                              </li>

                            )}

                            {!admission.triage &&
                              !admission.consultation &&
                              !admission.hospitalisation && (

                                <li>

                                  <button
                                    type="button"
                                    className="text-error"
                                    onClick={() =>
                                      handleDelete(
                                        admission,
                                      )
                                    }
                                  >

                                    <Trash2
                                      size={16}
                                    />

                                    Supprimer

                                  </button>

                                </li>

                              )}

                          </ul>

                        </div>

                      </div>

                    </td>

                  </tr>

                );
              },
            )

          )}

        </tbody>

      </table>

    </div>

    {/* ==================================================
        PAGINATION
    ================================================== */}

    {admissionsFiltrees.length > 0 && (

      <div className="flex flex-col gap-3 border-t border-base-200 p-4 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-sm text-base-content/60">

          Affichage de
          {" "}
          {Math.min(
            (pageActuelle - 1) *
              ELEMENTS_PAR_PAGE +
              1,
            admissionsFiltrees.length,
          )}
          {" "}
          à
          {" "}
          {Math.min(
            pageActuelle *
              ELEMENTS_PAR_PAGE,
            admissionsFiltrees.length,
          )}
          {" "}
          sur
          {" "}
          {admissionsFiltrees.length}

        </p>

        <div className="join">

          <button
            type="button"
            className="join-item btn btn-sm"
            disabled={
              pageActuelle === 1
            }
            onClick={() =>
              setPage(
                (previous) =>
                  Math.max(
                    1,
                    previous - 1,
                  ),
              )
            }
          >

            <ChevronLeft
              size={17}
            />

          </button>

          <button
            type="button"
            className="join-item btn btn-sm pointer-events-none"
          >

            Page
            {" "}
            {pageActuelle}
            {" / "}
            {totalPages}

          </button>

          <button
            type="button"
            className="join-item btn btn-sm"
            disabled={
              pageActuelle ===
              totalPages
            }
            onClick={() =>
              setPage(
                (previous) =>
                  Math.min(
                    totalPages,
                    previous + 1,
                  ),
              )
            }
          >

            <ChevronRight
              size={17}
            />

          </button>

        </div>

      </div>

    )}

  </div>

</div>


);
}

/* ==========================================================
STAT CARD
========================================================== */

function StatCard({
label,
value,
icon,
color,
}: {
label: string;
value: number;
icon: React.ReactNode;
color:
| "primary"
| "warning"
| "info"
| "secondary"
| "success";
}) {
const classes = {
primary:
"bg-primary/10 text-primary",


warning:
  "bg-warning/10 text-warning",

info:
  "bg-info/10 text-info",

secondary:
  "bg-secondary/10 text-secondary",

success:
  "bg-success/10 text-success",


};

return ( <div className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">


  <div className="flex items-center justify-between">

    <div>

      <p className="text-sm text-base-content/60">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black">
        {value}
      </p>

    </div>

    <div
      className={`flex h-12 w-12 items-center justify-center rounded-xl ${classes[color]}`}
    >

      {icon}

    </div>

  </div>

</div>


);
}
