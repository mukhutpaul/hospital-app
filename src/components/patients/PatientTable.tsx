"use client";

import {
deletePatient,
togglePatient,
} from "@/app/actions/patient";

import Link from "next/link";
import { useMemo, useState } from "react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
Search,
Users,
UserRound,
CheckCircle2,
XCircle,
Eye,
Pencil,
Power,
Trash2,
ChevronLeft,
ChevronRight,
Phone,
FileText,
RotateCcw,
Filter,
Activity,
CalendarDays,
Stethoscope,
BedDouble,
Receipt,
ClipboardList,
ArrowUpDown,
UserCheck,
} from "lucide-react";

/* ==========================================================
TYPE PATIENT
========================================================== */

type Patient = {
id: number;

numeroDossier: string;

nom: string;
postNom: string | null;
prenom: string | null;

sexe: string;

dateNaissance: Date | string | null;

telephone: string | null;
email: string | null;

adresse: string | null;

actif: boolean;

createdAt: Date | string;
updatedAt: Date | string;

_count: {
rendezVous: number;
admissions: number;
consultations: number;
prescriptions: number;
demandesLabo: number;
demandesImagerie: number;
hospitalisations: number;
factures: number;
paiements: number;
};
};

type Props = {
patients: Patient[];
};

/* ==========================================================
CONSTANTES
========================================================== */

const OPTIONS_PAR_PAGE = [10, 20, 50, 100];

/* ==========================================================
COMPOSANT
========================================================== */

export default function PatientsTable({
patients,
}: Props) {
/* ========================================================
STATES
======================================================== */

const [search, setSearch] = useState("");

const [statut, setStatut] = useState<
"TOUS" | "ACTIF" | "INACTIF"

> ("TOUS");

const [sexe, setSexe] = useState<
"TOUS" | string

> ("TOUS");

const [tri, setTri] = useState<
"NOM_ASC" | "NOM_DESC" | "RECENT" | "ANCIEN"

> ("NOM_ASC");

const [page, setPage] = useState(1);

const [elementsParPage, setElementsParPage] =
useState(10);

const [loadingId, setLoadingId] = useState<
number | null

> (null);

/* ========================================================
NOM COMPLET
======================================================== */

function getNomComplet(patient: Patient) {
return [
patient.nom,
patient.postNom,
patient.prenom,
]
.filter(Boolean)
.join(" ");
}

/* ========================================================
ACTIVITÉ MÉDICALE
======================================================== */

function getTotalActivite(patient: Patient) {
return (
patient._count.rendezVous +
patient._count.admissions +
patient._count.consultations +
patient._count.prescriptions +
patient._count.demandesLabo +
patient._count.demandesImagerie +
patient._count.hospitalisations +
patient._count.factures +
patient._count.paiements
);
}

/* ========================================================
FILTRAGE + TRI
======================================================== */

const patientsFiltres = useMemo(() => {
const terme = search
.trim()
.toLowerCase();


const resultat = patients.filter((patient) => {
  const nomComplet =
    getNomComplet(patient).toLowerCase();

  const correspondRecherche =
    !terme ||
    nomComplet.includes(terme) ||
    patient.numeroDossier
      .toLowerCase()
      .includes(terme) ||
    patient.telephone
      ?.toLowerCase()
      .includes(terme) ||
    patient.email
      ?.toLowerCase()
      .includes(terme) ||
    patient.adresse
      ?.toLowerCase()
      .includes(terme);

  const correspondStatut =
    statut === "TOUS" ||
    (statut === "ACTIF" &&
      patient.actif) ||
    (statut === "INACTIF" &&
      !patient.actif);

  const correspondSexe =
    sexe === "TOUS" ||
    patient.sexe === sexe;

  return (
    correspondRecherche &&
    correspondStatut &&
    correspondSexe
  );
});

return [...resultat].sort((a, b) => {
  if (tri === "NOM_ASC") {
    return getNomComplet(a).localeCompare(
      getNomComplet(b),
    );
  }

  if (tri === "NOM_DESC") {
    return getNomComplet(b).localeCompare(
      getNomComplet(a),
    );
  }

  if (tri === "RECENT") {
    return (
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
    );
  }

  return (
    new Date(a.createdAt).getTime() -
    new Date(b.createdAt).getTime()
  );
});


}, [
patients,
search,
statut,
sexe,
tri,
]);

/* ========================================================
PAGINATION
======================================================== */

const totalPages = Math.max(
1,
Math.ceil(
patientsFiltres.length /
elementsParPage,
),
);

const pageActuelle = Math.min(
page,
totalPages,
);

const patientsPage =
patientsFiltres.slice(
(pageActuelle - 1) *
elementsParPage,
pageActuelle *
elementsParPage,
);

/* ========================================================
STATISTIQUES
======================================================== */

const totalActifs = patients.filter(
(patient) => patient.actif,
).length;

const totalInactifs =
patients.length -
totalActifs;

const totalHommes = patients.filter(
(patient) =>
patient.sexe.toUpperCase() === "M" ||
patient.sexe.toUpperCase() ===
"MASCULIN",
).length;

const totalFemmes = patients.filter(
(patient) =>
patient.sexe.toUpperCase() === "F" ||
patient.sexe.toUpperCase() ===
"FEMININ",
).length;

/* ========================================================
SEXES DISPONIBLES
======================================================== */

const sexesDisponibles = Array.from(
new Set(
patients
.map(
(patient) =>
patient.sexe,
)
.filter(Boolean),
),
);

/* ========================================================
RESET FILTRES
======================================================== */

function resetFiltres() {
setSearch("");
setStatut("TOUS");
setSexe("TOUS");
setTri("NOM_ASC");
setPage(1);
}

const filtresActifs =
search ||
statut !== "TOUS" ||
sexe !== "TOUS" ||
tri !== "NOM_ASC";

/* ========================================================
ACTIVER / DÉSACTIVER
======================================================== */

async function handleToggle(
patient: Patient,
) {
const action = patient.actif
? "désactiver"
: "activer";

const result = await Swal.fire({
  title:
    action === "activer"
      ? "Activer le patient ?"
      : "Désactiver le patient ?",

  text: `Voulez-vous vraiment ${action} « ${getNomComplet(
    patient,
  )} » ?`,

  icon: "question",

  showCancelButton: true,

  confirmButtonText:
    action === "activer"
      ? "Oui, activer"
      : "Oui, désactiver",

  cancelButtonText:
    "Annuler",

  reverseButtons: true,
});

if (!result.isConfirmed) {
  return;
}

setLoadingId(patient.id);

try {
  const response =
    await togglePatient(
      patient.id,
    );

  if (!response.success) {
    toast.error(
      response.message,
    );
    return;
  }

  toast.success(
    response.message,
  );
} catch (error) {
  console.error(error);

  toast.error(
    "Une erreur est survenue lors de la modification du statut.",
  );
} finally {
  setLoadingId(null);
}


}

/* ========================================================
SUPPRIMER
======================================================== */

async function handleDelete(
patient: Patient,
) {
const result = await Swal.fire({
title:
"Supprimer le patient ?",


  html: `
    <div class="text-sm">
      Vous êtes sur le point de supprimer
      <strong>${getNomComplet(
        patient,
      )}</strong>.
      <br />
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

  cancelButtonColor:
    "#6b7280",

  reverseButtons: true,
});

if (!result.isConfirmed) {
  return;
}

setLoadingId(patient.id);

try {
  const response =
    await deletePatient(
      patient.id,
    );

  if (!response.success) {
    toast.error(
      response.message,
    );
    return;
  }

  toast.success(
    response.message,
  );
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
ÉTAT VIDE
======================================================== */

if (patients.length === 0) {
return ( <div className="card border border-dashed border-base-300 bg-base-100"> <div className="card-body items-center py-16 text-center">


      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Users size={38} />
      </div>

      <h3 className="mt-4 text-xl font-bold">
        Aucun patient enregistré
      </h3>

      <p className="max-w-md text-base-content/60">
        Commencez par enregistrer votre premier patient
        afin de gérer son dossier médical.
      </p>

      <Link
        href="/patients/nouveau"
        className="btn btn-primary mt-4"
      >
        <UserRound size={18} />
        Nouveau patient
      </Link>

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

  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">

    <div className="stat rounded-2xl border border-base-200 bg-base-100 shadow-sm">
      <div className="stat-figure text-primary">
        <Users size={28} />
      </div>

      <div className="stat-title">
        Total patients
      </div>

      <div className="stat-value text-primary">
        {patients.length}
      </div>

      <div className="stat-desc">
        Patients enregistrés
      </div>
    </div>

    <div className="stat rounded-2xl border border-base-200 bg-base-100 shadow-sm">
      <div className="stat-figure text-success">
        <UserCheck size={28} />
      </div>

      <div className="stat-title">
        Patients actifs
      </div>

      <div className="stat-value text-success">
        {totalActifs}
      </div>

      <div className="stat-desc">
        Dossiers actifs
      </div>
    </div>

    <div className="stat rounded-2xl border border-base-200 bg-base-100 shadow-sm">
      <div className="stat-figure text-error">
        <XCircle size={28} />
      </div>

      <div className="stat-title">
        Inactifs
      </div>

      <div className="stat-value text-error">
        {totalInactifs}
      </div>

      <div className="stat-desc">
        Dossiers désactivés
      </div>
    </div>

    <div className="stat rounded-2xl border border-base-200 bg-base-100 shadow-sm">
      <div className="stat-figure text-info">
        <UserRound size={28} />
      </div>

      <div className="stat-title">
        Hommes
      </div>

      <div className="stat-value text-info">
        {totalHommes}
      </div>

      <div className="stat-desc">
        Patients masculins
      </div>
    </div>

    <div className="stat rounded-2xl border border-base-200 bg-base-100 shadow-sm">
      <div className="stat-figure text-secondary">
        <UserRound size={28} />
      </div>

      <div className="stat-title">
        Femmes
      </div>

      <div className="stat-value text-secondary">
        {totalFemmes}
      </div>

      <div className="stat-desc">
        Patients féminins
      </div>
    </div>

  </div>

  {/* ====================================================
      FILTRES
  ==================================================== */}

  <div className="card border border-base-200 bg-base-100 shadow-sm">

    <div className="card-body gap-5">

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-2">

          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Filter size={19} />
          </div>

          <div>

            <h2 className="font-bold">
              Recherche et filtres
            </h2>

            <p className="text-sm text-base-content/60">
              Trouvez rapidement un patient
            </p>

          </div>

        </div>

        <div className="badge badge-primary badge-outline">
          {patientsFiltres.length} résultat(s)
        </div>

      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

        {/* RECHERCHE */}

        <label className="input input-bordered flex items-center gap-2">

          <Search
            size={18}
            className="text-base-content/50"
          />

          <input
            type="text"
            placeholder="Nom, dossier, téléphone..."
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value,
              );

              setPage(1);
            }}
            className="grow"
          />

        </label>

        {/* STATUT */}

        <select
          className="select select-bordered"
          value={statut}
          onChange={(event) => {
            setStatut(
              event.target.value as
                | "TOUS"
                | "ACTIF"
                | "INACTIF",
            );

            setPage(1);
          }}
        >

          <option value="TOUS">
            Tous les statuts
          </option>

          <option value="ACTIF">
            Patients actifs
          </option>

          <option value="INACTIF">
            Patients inactifs
          </option>

        </select>

        {/* SEXE */}

        <select
          className="select select-bordered"
          value={sexe}
          onChange={(event) => {
            setSexe(
              event.target.value,
            );

            setPage(1);
          }}
        >

          <option value="TOUS">
            Tous les sexes
          </option>

          {sexesDisponibles.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ),
          )}

        </select>

        {/* TRI */}

        <select
          className="select select-bordered"
          value={tri}
          onChange={(event) => {
            setTri(
              event.target.value as
                | "NOM_ASC"
                | "NOM_DESC"
                | "RECENT"
                | "ANCIEN",
            );

            setPage(1);
          }}
        >

          <option value="NOM_ASC">
            Nom : A → Z
          </option>

          <option value="NOM_DESC">
            Nom : Z → A
          </option>

          <option value="RECENT">
            Plus récents
          </option>

          <option value="ANCIEN">
            Plus anciens
          </option>

        </select>

      </div>

      {/* ACTIONS FILTRES */}

      {filtresActifs && (

        <div className="flex justify-end">

          <button
            type="button"
            onClick={resetFiltres}
            className="btn btn-sm btn-ghost"
          >
            <RotateCcw size={16} />
            Réinitialiser les filtres
          </button>

        </div>

      )}

    </div>

  </div>

  {/* ====================================================
      TABLEAU
  ==================================================== */}

  <div className="card overflow-hidden border border-base-200 bg-base-100 shadow-sm">

    <div className="border-b border-base-200 px-5 py-4">

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h2 className="font-bold">
            Liste des patients
          </h2>

          <p className="text-sm text-base-content/60">
            Gestion des dossiers médicaux
          </p>

        </div>

        <div className="flex items-center gap-2 text-sm text-base-content/60">

          <Activity size={16} />

          {patientsFiltres.length}
          {" "}
          patient(s) affiché(s)

        </div>

      </div>

    </div>

    <div className="overflow-x-auto">

      <table className="table table-zebra">

        <thead>

          <tr>

            <th>Patient</th>

            <th>Dossier</th>

            <th>Sexe</th>

            <th>Contact</th>

            <th>Activité médicale</th>

            <th>Statut</th>

            <th className="text-right">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {patientsPage.length === 0 ? (

            <tr>

              <td
                colSpan={7}
                className="py-16 text-center"
              >

                <div className="flex flex-col items-center gap-3 text-base-content/50">

                  <div className="rounded-full bg-base-200 p-5">
                    <Search size={35} />
                  </div>

                  <div>

                    <p className="font-semibold text-base-content">
                      Aucun patient trouvé
                    </p>

                    <p className="text-sm">
                      Essayez de modifier vos critères
                      de recherche.
                    </p>

                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={resetFiltres}
                  >
                    Réinitialiser
                  </button>

                </div>

              </td>

            </tr>

          ) : (

            patientsPage.map(
              (patient) => {
                const loading =
                  loadingId === patient.id;

                const activite =
                  getTotalActivite(
                    patient,
                  );

                return (

                  <tr
                    key={patient.id}
                    className="hover"
                  >

                    {/* PATIENT */}

                    <td>

                      <div className="flex items-center gap-3">

                        <div className="avatar placeholder">

                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">

                            <UserRound
                              size={20}
                            />

                          </div>

                        </div>

                        <div>

                          <div className="font-bold">

                            {getNomComplet(
                              patient,
                            )}

                          </div>

                          <div className="text-xs text-base-content/50">

                            Patient #{patient.id}

                          </div>

                        </div>

                      </div>

                    </td>

                    {/* DOSSIER */}

                    <td>

                      <div className="flex items-center gap-2">

                        <FileText
                          size={16}
                          className="text-base-content/50"
                        />

                        <span className="font-semibold">
                          {
                            patient.numeroDossier
                          }
                        </span>

                      </div>

                    </td>

                    {/* SEXE */}

                    <td>

                      <span className="badge badge-outline">
                        {patient.sexe}
                      </span>

                    </td>

                    {/* CONTACT */}

                    <td>

                      <div className="space-y-1">

                        {patient.telephone && (

                          <div className="flex items-center gap-2 text-sm">

                            <Phone
                              size={14}
                              className="text-base-content/50"
                            />

                            {patient.telephone}

                          </div>

                        )}

                        {patient.email && (

                          <div className="max-w-[180px] truncate text-xs text-base-content/50">

                            {patient.email}

                          </div>

                        )}

                        {!patient.telephone &&
                          !patient.email && (

                            <span className="text-base-content/40">
                              —
                            </span>

                          )}

                      </div>

                    </td>

                    {/* ACTIVITÉ */}

                    <td>

                      <div className="flex flex-wrap gap-1">

                        <span
                          className="badge badge-info badge-outline"
                          title="Rendez-vous"
                        >
                          <CalendarDays size={12} />

                          {
                            patient._count
                              .rendezVous
                          }
                        </span>

                        <span
                          className="badge badge-primary badge-outline"
                          title="Consultations"
                        >
                          <Stethoscope size={12} />

                          {
                            patient._count
                              .consultations
                          }
                        </span>

                        <span
                          className="badge badge-secondary badge-outline"
                          title="Hospitalisations"
                        >
                          <BedDouble size={12} />

                          {
                            patient._count
                              .hospitalisations
                          }
                        </span>

                        <span
                          className="badge badge-warning badge-outline"
                          title="Factures"
                        >
                          <Receipt size={12} />

                          {
                            patient._count
                              .factures
                          }
                        </span>

                        <span
                          className="badge badge-neutral badge-outline"
                          title="Total activité"
                        >
                          <Activity size={12} />

                          {activite}

                        </span>

                      </div>

                    </td>

                    {/* STATUT */}

                    <td>

                      {patient.actif ? (

                        <span className="badge badge-success gap-1">

                          <CheckCircle2
                            size={13}
                          />

                          Actif

                        </span>

                      ) : (

                        <span className="badge badge-error gap-1">

                          <XCircle
                            size={13}
                          />

                          Inactif

                        </span>

                      )}

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="flex justify-end gap-1">

                        <Link
                          href={`/patients/${patient.id}`}
                          className="btn btn-sm btn-ghost tooltip"
                          data-tip="Voir le dossier"
                        >
                          <Eye size={16} />
                        </Link>

                        <Link
                          href={`/patients/${patient.id}/modifier`}
                          className="btn btn-sm btn-outline tooltip"
                          data-tip="Modifier"
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleToggle(
                              patient,
                            )
                          }
                          className={`btn btn-sm tooltip ${
                            patient.actif
                              ? "btn-warning"
                              : "btn-success"
                          }`}
                          data-tip={
                            patient.actif
                              ? "Désactiver"
                              : "Activer"
                          }
                        >

                          {loading ? (

                            <span className="loading loading-spinner loading-xs" />

                          ) : (

                            <Power size={16} />

                          )}

                        </button>

                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleDelete(
                              patient,
                            )
                          }
                          className="btn btn-sm btn-error btn-outline tooltip"
                          data-tip="Supprimer"
                        >

                          {loading ? (

                            <span className="loading loading-spinner loading-xs" />

                          ) : (

                            <Trash2 size={16} />

                          )}

                        </button>

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

    {patientsFiltres.length > 0 && (

      <div className="flex flex-col gap-4 border-t border-base-200 p-4 lg:flex-row lg:items-center lg:justify-between">

        {/* INFORMATIONS */}

        <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/60">

          <span>

            Affichage de{" "}

            <strong className="text-base-content">

              {Math.min(
                (pageActuelle - 1) *
                  elementsParPage +
                  1,
                patientsFiltres.length,
              )}

              {" - "}

              {Math.min(
                pageActuelle *
                  elementsParPage,
                patientsFiltres.length,
              )}

            </strong>

            {" sur "}

            <strong className="text-base-content">
              {patientsFiltres.length}
            </strong>

          </span>

          <select
            className="select select-bordered select-sm"
            value={elementsParPage}
            onChange={(event) => {
              setElementsParPage(
                Number(
                  event.target.value,
                ),
              );

              setPage(1);
            }}
          >

            {OPTIONS_PAR_PAGE.map(
              (option) => (

                <option
                  key={option}
                  value={option}
                >
                  {option} / page
                </option>

              ),
            )}

          </select>

        </div>

        {/* PAGINATION */}

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

            <ChevronLeft size={17} />

          </button>

          <button
            type="button"
            className="join-item btn btn-sm pointer-events-none"
          >

            Page{" "}

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

            <ChevronRight size={17} />

          </button>

        </div>

      </div>

    )}

  </div>

</div>


);
}
