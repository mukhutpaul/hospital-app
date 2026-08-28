"use client";

import {
MoreHorizontal,
Pencil,
Power,
Stethoscope,
Trash2,
Users,
} from "lucide-react";

import Swal from "sweetalert2";

import { toast } from "react-toastify";

import {
deleteSpecialite,
toggleSpecialite,
} from "@/app/actions/specialite";

type Props = {
specialites: any[];

onEdit: (
specialite: any
) => void;
};

export default function SpecialiteTable({
specialites,
onEdit,
}: Props) {

async function handleToggle(
specialite: any
) {


const action =
  specialite.actif
    ? "désactiver"
    : "activer";

const result =
  await Swal.fire({

    title:
      `${action === "désactiver" ? "Désactiver" : "Activer"} cette spécialité ?`,

    text:
      specialite.nom,

    icon:
      specialite.actif
        ? "warning"
        : "question",

    showCancelButton: true,

    confirmButtonText:
      specialite.actif
        ? "Oui, désactiver"
        : "Oui, activer",

    cancelButtonText:
      "Annuler",

  });

if (!result.isConfirmed) {
  return;
}

const response =
  await toggleSpecialite(
    specialite.id
  );

if (response.success) {

  toast.success(
    response.message
  );

  window.location.reload();

} else {

  toast.error(
    response.message
  );

}


}

async function handleDelete(
specialite: any
) {


const result =
  await Swal.fire({

    title:
      "Supprimer cette spécialité ?",

    text:
      `${specialite.code} — ${specialite.nom}`,

    icon:
      "warning",

    showCancelButton:
      true,

    confirmButtonText:
      "Oui, supprimer",

    cancelButtonText:
      "Annuler",

    confirmButtonColor:
      "#d33",

  });

if (!result.isConfirmed) {
  return;
}

const response =
  await deleteSpecialite(
    specialite.id
  );

if (response.success) {

  toast.success(
    response.message
  );

  window.location.reload();

} else {

  toast.error(
    response.message
  );

}


}

if (!specialites.length) {


return (

  <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 py-16 text-center">

    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200 text-base-content/40">

      <Stethoscope
        size={28}
      />

    </div>

    <h3 className="mt-4 text-lg font-bold">

      Aucune spécialité trouvée

    </h3>

    <p className="mt-1 text-sm text-base-content/60">

      Aucune spécialité ne correspond aux critères sélectionnés.

    </p>

  </div>

);


}

return (


<div className="overflow-hidden rounded-3xl border border-base-200 bg-base-100 shadow-sm">

  <div className="overflow-x-auto">

    <table className="table">

      <thead className="bg-base-200/50">

        <tr>

          <th>Spécialité</th>

          <th>Service</th>

          <th>Médecins</th>

          <th>Statut</th>

          <th className="text-right">

            Actions

          </th>

        </tr>

      </thead>

      <tbody>

        {specialites.map(
          (specialite) => (

            <tr
              key={
                specialite.id
              }
              className="hover"
            >

              {/* SPECIALITE */}

              <td>

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">

                    <Stethoscope
                      size={20}
                    />

                  </div>

                  <div>

                    <p className="font-bold">

                      {specialite.nom}

                    </p>

                    <p className="text-xs font-mono text-base-content/50">

                      {specialite.code}

                    </p>

                  </div>

                </div>

              </td>

              {/* SERVICE */}

              <td>

                {specialite.service ? (

                  <div>

                    <p className="font-medium">

                      {specialite.service.nom}

                    </p>

                    <p className="text-xs text-base-content/50">

                      {specialite.service.code}

                    </p>

                  </div>

                ) : (

                  <span className="text-base-content/40">

                    Aucun service

                  </span>

                )}

              </td>

              {/* MEDECINS */}

              <td>

                <div className="flex items-center gap-2">

                  <Users
                    size={16}
                    className="text-primary"
                  />

                  <span className="font-semibold">

                    {specialite._count
                      ?.medecins || 0}

                  </span>

                </div>

              </td>

              {/* STATUS */}

              <td>

                <span
                  className={`badge ${
                    specialite.actif
                      ? "badge-success"
                      : "badge-ghost"
                  }`}
                >

                  {specialite.actif
                    ? "Active"
                    : "Inactive"}

                </span>

              </td>

              {/* ACTIONS */}

              <td>

                <div className="flex justify-end">

                  <div className="dropdown dropdown-end">

                    <button
                      type="button"
                      className="btn btn-sm btn-ghost btn-circle"
                    >

                      <MoreHorizontal
                        size={19}
                      />

                    </button>

                    <ul className="dropdown-content menu z-50 w-60 rounded-2xl border border-base-200 bg-base-100 p-2 shadow-xl">

                      <li>

                        <button
                          type="button"
                          onClick={() =>
                            onEdit(
                              specialite
                            )
                          }
                        >

                          <Pencil
                            size={16}
                          />

                          Modifier

                        </button>

                      </li>

                      <li>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggle(
                              specialite
                            )
                          }
                        >

                          <Power
                            size={16}
                          />

                          {specialite.actif
                            ? "Désactiver"
                            : "Activer"}

                        </button>

                      </li>

                      <li>

                        <button
                          type="button"
                          className="text-error"
                          onClick={() =>
                            handleDelete(
                              specialite
                            )
                          }
                        >

                          <Trash2
                            size={16}
                          />

                          Supprimer

                        </button>

                      </li>

                    </ul>

                  </div>

                </div>

              </td>

            </tr>

          )
        )}

      </tbody>

    </table>

  </div>

</div>


);

}
