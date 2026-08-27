"use client";
import { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  addConstante,
  addDocument,
  addAllergie,
  addAntecedent,
  deleteConstante,
  deleteDocument,
  deleteAllergie,
  deleteAntecedent,
} from "@/app/actions/patients";

const fmt = (d: any) => (d ? new Date(d).toLocaleString("fr-FR") : "—");
const del = async (fn: () => Promise<any>) => {
  const x = await Swal.fire({
    icon: "warning",
    title: "Confirmer",
    text: "Cette suppression est irréversible.",
    showCancelButton: true,
    confirmButtonText: "Supprimer",
    cancelButtonText: "Annuler",
  });
  if (x.isConfirmed) {
    const r = await fn();
    r.success ? toast.success(r.message) : toast.error(r.message);
  }
};
export default function PatientDossier({ patient }: { patient: any }) {
  const [tab, setTab] = useState("resume");
  const [busy, setBusy] = useState(false);
  async function doc(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const r = await addDocument(new FormData(e.currentTarget));
    setBusy(false);
    r.success ? toast.success(r.message) : toast.error(r.message);
    if (r.success) e.currentTarget.reset();
  }
  async function constante(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const num = (k: string) => (f.get(k) ? Number(f.get(k)) : null);
    const r = await addConstante({
      patientId: patient.id,
      temperature: num("temperature"),
      tensionSystolique: num("tensionSystolique"),
      tensionDiastolique: num("tensionDiastolique"),
      pouls: num("pouls"),
      saturation: num("saturation"),
      poids: num("poids"),
      taille: num("taille"),
      frequenceRespiratoire: num("frequenceRespiratoire"),
      glycemie: num("glycemie"),
    });
    setBusy(false);
    r.success ? toast.success(r.message) : toast.error(r.message);
    if (r.success) e.currentTarget.reset();
  }
  async function allergy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await addAllergie({
      patientId: patient.id,
      allergene: String(f.get("allergene")),
      reaction: String(f.get("reaction") || ""),
      gravite: String(f.get("gravite") || ""),
      description: String(f.get("description") || ""),
    });
    r.success ? toast.success(r.message) : toast.error(r.message);
    if (r.success) e.currentTarget.reset();
  }
  async function antecedent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await addAntecedent({
      patientId: patient.id,
      type: String(f.get("type")),
      libelle: String(f.get("libelle")),
      description: String(f.get("description") || ""),
      dateDebut: String(f.get("dateDebut") || ""),
      dateFin: String(f.get("dateFin") || ""),
    });
    r.success ? toast.success(r.message) : toast.error(r.message);
    if (r.success) e.currentTarget.reset();
  }
  const timeline = [
    ...(patient.rendezVous || []).map((x: any) => ({
      date: x.dateHeure,
      type: "Rendez-vous",
      title: `RDV ${x.statut}`,
      desc: [
        x.medecin && `Dr ${x.medecin.nom} ${x.medecin.prenom || ""}`,
        x.service?.nom,
        x.motif,
      ]
        .filter(Boolean)
        .join(" · "),
    })),
    ...(patient.admissions || []).map((x: any) => ({
      date: x.dateAdmission,
      type: "Admission",
      title: `Admission ${x.statut}`,
      desc: [x.service?.nom, x.motif].filter(Boolean).join(" · "),
    })),
    ...(patient.consultations || []).map((x: any) => ({
      date: x.dateConsultation,
      type: "Consultation",
      title: x.diagnostic || "Consultation médicale",
      desc: [
        x.medecin && `Dr ${x.medecin.nom} ${x.medecin.prenom || ""}`,
        x.motif,
        x.conclusion,
      ]
        .filter(Boolean)
        .join(" · "),
    })),
    ...(patient.hospitalisations || []).map((x: any) => ({
      date: x.dateEntree,
      type: "Hospitalisation",
      title: `Hospitalisation ${x.statut}`,
      desc: [
        x.service?.nom,
        x.lit && `Lit ${x.lit.numero}`,
        x.lit?.chambre && `Chambre ${x.lit.chambre.numero}`,
      ]
        .filter(Boolean)
        .join(" · "),
    })),
    ...(patient.paiements || []).map((x: any) => ({
      date: x.datePaiement,
      type: "Paiement",
      title: `Paiement ${x.montant} ${x.devise}`,
      desc: x.modePaiement,
    })),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const tabs = [
    ["resume", "Résumé"],
    ["parcours", "Parcours"],
    ["constantes", "Constantes"],
    ["documents", "Documents"],
    ["allergies", "Allergies"],
    ["antecedents", "Antécédents"],
    ["medical", "Soins & prescriptions"],
  ];
  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`btn btn-sm whitespace-nowrap ${tab === id ? "btn-primary" : "btn-ghost"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "resume" && (
        <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-4">
          <div className="stat bg-base-100 border rounded-2xl">
            <div className="stat-title">Rendez-vous</div>
            <div className="stat-value">{patient.rendezVous.length}</div>
          </div>
          <div className="stat bg-base-100 border rounded-2xl">
            <div className="stat-title">Consultations</div>
            <div className="stat-value">{patient.consultations.length}</div>
          </div>
          <div className="stat bg-base-100 border rounded-2xl">
            <div className="stat-title">Hospitalisations</div>
            <div className="stat-value">{patient.hospitalisations.length}</div>
          </div>
          <div className="stat bg-base-100 border rounded-2xl">
            <div className="stat-title">Documents</div>
            <div className="stat-value">{patient.documents.length}</div>
          </div>
          <div className="xl:col-span-4 card bg-base-100 border shadow-sm">
            <div className="card-body">
              <h3 className="font-bold text-lg">Dernière activité</h3>
              {timeline.slice(0, 5).map((x: any, i) => (
                <div key={i} className="flex gap-4 py-3 border-b last:border-0">
                  <div className="badge badge-primary badge-outline">
                    {x.type}
                  </div>
                  <div>
                    <div className="font-semibold">{x.title}</div>
                    <div className="text-sm text-base-content/60">
                      {fmt(x.date)} · {x.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab === "parcours" && (
        <div className="card bg-base-100 border shadow-sm">
          <div className="card-body">
            <h2 className="text-xl font-bold">Parcours du patient</h2>
            <p className="text-sm text-base-content/60 mb-4">
              Historique chronologique des événements enregistrés dans le
              dossier.
            </p>
            <div className="timeline timeline-vertical">
              {timeline.map((x: any, i) => (
                <div className="timeline-item" key={i}>
                  <div className="timeline-start text-xs text-base-content/60">
                    {fmt(x.date)}
                  </div>
                  <div className="timeline-middle">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  </div>
                  <div className="timeline-end pb-6">
                    <div className="badge badge-outline">{x.type}</div>
                    <h3 className="font-bold mt-1">{x.title}</h3>
                    <p className="text-sm text-base-content/60">
                      {x.desc || "Aucune observation"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab === "constantes" && (
        <div className="grid xl:grid-cols-[360px_1fr] gap-5">
          <form
            onSubmit={constante}
            className="card bg-base-100 border shadow-sm"
          >
            <div className="card-body">
              <h2 className="font-bold text-lg">
                Nouvelle prise de constantes
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["temperature", "Temp. °C"],
                  ["tensionSystolique", "TA syst."],
                  ["tensionDiastolique", "TA diast."],
                  ["pouls", "Pouls"],
                  ["saturation", "SpO₂ %"],
                  ["poids", "Poids kg"],
                  ["taille", "Taille cm"],
                  ["frequenceRespiratoire", "FR /min"],
                  ["glycemie", "Glycémie"],
                ].map(([n, l]) => (
                  <label className="form-control" key={n}>
                    <span className="label-text text-xs">{l}</span>
                    <input
                      name={n}
                      type="number"
                      step="0.1"
                      className="input input-bordered input-sm"
                    />
                  </label>
                ))}
              </div>
              <button disabled={busy} className="btn btn-primary mt-2">
                Enregistrer les constantes
              </button>
            </div>
          </form>
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body overflow-x-auto">
              <h2 className="font-bold text-lg">Historique</h2>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>TA</th>
                    <th>Pouls</th>
                    <th>Temp.</th>
                    <th>SpO₂</th>
                    <th>Poids</th>
                    <th>Glycémie</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {patient.constantes.map((c: any) => (
                    <tr key={c.id}>
                      <td>{fmt(c.dateMesure)}</td>
                      <td>
                        {c.tensionSystolique || "—"}/
                        {c.tensionDiastolique || "—"}
                      </td>
                      <td>{c.pouls || "—"}</td>
                      <td>{c.temperature || "—"}</td>
                      <td>{c.saturation || "—"}</td>
                      <td>{c.poids || "—"}</td>
                      <td>{c.glycemie || "—"}</td>
                      <td>
                        <button
                          className="btn btn-xs btn-error btn-outline"
                          onClick={() =>
                            del(() => deleteConstante(c.id, patient.id))
                          }
                        >
                          Suppr.
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {tab === "documents" && (
        <div className="grid xl:grid-cols-[380px_1fr] gap-5">
          <form onSubmit={doc} className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <h2 className="font-bold text-lg">Ajouter un document</h2>
              <input type="hidden" name="patientId" value={patient.id} />
              <input
                name="nom"
                className="input input-bordered"
                placeholder="Nom du document"
              />
              <select name="type" className="select select-bordered">
                <option>PIECE_IDENTITE</option>
                <option>RESULTAT_LABORATOIRE</option>
                <option>IMAGERIE</option>
                <option>ORDONNANCE</option>
                <option>ASSURANCE</option>
                <option>AUTRE</option>
              </select>
              <textarea
                name="description"
                className="textarea textarea-bordered"
                placeholder="Description"
              />
              <input
                name="file"
                required
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="file-input file-input-bordered w-full"
              />
              <button disabled={busy} className="btn btn-primary">
                Ajouter le document
              </button>
            </div>
          </form>
          <div className="grid md:grid-cols-2 gap-4">
            {patient.documents.map((d: any) => (
              <div key={d.id} className="card bg-base-100 border shadow-sm">
                <div className="card-body">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-bold">{d.nom}</div>
                      <div className="badge badge-outline mt-1">{d.type}</div>
                    </div>
                    <button
                      className="btn btn-xs btn-error btn-outline"
                      onClick={() =>
                        del(() => deleteDocument(d.id, patient.id))
                      }
                    >
                      Suppr.
                    </button>
                  </div>
                  <p className="text-sm text-base-content/60">
                    {d.description || "Aucune description"} ·{" "}
                    {fmt(d.dateDocument)}
                  </p>
                  <a
                    href={d.fichier}
                    target="_blank"
                    className="btn btn-sm btn-outline btn-primary"
                  >
                    Ouvrir
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "allergies" && (
        <div className="grid lg:grid-cols-[380px_1fr] gap-5">
          <form
            onSubmit={allergy}
            className="card bg-base-100 border shadow-sm"
          >
            <div className="card-body">
              <h2 className="font-bold">Nouvelle allergie</h2>
              <input
                name="allergene"
                required
                className="input input-bordered"
                placeholder="Allergène"
              />
              <input
                name="reaction"
                className="input input-bordered"
                placeholder="Réaction"
              />
              <select name="gravite" className="select select-bordered">
                <option value="">Gravité</option>
                <option>Légère</option>
                <option>Modérée</option>
                <option>Sévère</option>
              </select>
              <textarea
                name="description"
                className="textarea textarea-bordered"
                placeholder="Description"
              />
              <button className="btn btn-primary">Ajouter</button>
            </div>
          </form>
          <div className="space-y-3">
            {patient.allergies.map((a: any) => (
              <div key={a.id} className="alert border bg-base-100">
                <div>
                  <b>{a.allergene}</b> · {a.gravite || "gravité non précisée"}
                  <div className="text-sm">
                    {a.reaction || "Réaction non précisée"}
                  </div>
                </div>
                <button
                  className="btn btn-xs btn-error"
                  onClick={() => del(() => deleteAllergie(a.id, patient.id))}
                >
                  Suppr.
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "antecedents" && (
        <div className="grid lg:grid-cols-[400px_1fr] gap-5">
          <form
            onSubmit={antecedent}
            className="card bg-base-100 border shadow-sm"
          >
            <div className="card-body">
              <h2 className="font-bold">Nouvel antécédent</h2>
              <input
                name="type"
                required
                className="input input-bordered"
                placeholder="Type (chirurgie, maladie...)"
              />
              <input
                name="libelle"
                required
                className="input input-bordered"
                placeholder="Libellé"
              />
              <textarea
                name="description"
                className="textarea textarea-bordered"
                placeholder="Description"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="dateDebut"
                  type="date"
                  className="input input-bordered"
                />
                <input
                  name="dateFin"
                  type="date"
                  className="input input-bordered"
                />
              </div>
              <button className="btn btn-primary">Ajouter</button>
            </div>
          </form>
          <div className="space-y-3">
            {patient.antecedents.map((a: any) => (
              <div key={a.id} className="card bg-base-100 border">
                <div className="card-body p-4">
                  <div className="flex justify-between">
                    <div>
                      <span className="badge badge-primary">{a.type}</span>
                      <h3 className="font-bold">{a.libelle}</h3>
                      <p className="text-sm">{a.description || "—"}</p>
                    </div>
                    <button
                      className="btn btn-xs btn-error btn-outline"
                      onClick={() =>
                        del(() => deleteAntecedent(a.id, patient.id))
                      }
                    >
                      Suppr.
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "medical" && (
        <div className="space-y-5">
          <section className="card bg-base-100 border">
            <div className="card-body">
              <h2 className="font-bold text-lg">Prescriptions</h2>
              {patient.prescriptions.map((p: any) => (
                <div key={p.id} className="p-3 border rounded-xl mb-2">
                  <b>{p.numero}</b> · {fmt(p.datePrescription)} · {p.statut}
                  <div className="text-sm mt-1">
                    {p.lignes
                      .map(
                        (l: any) =>
                          `${l.medicament?.nom || "Médicament"} (${l.quantite})`,
                      )
                      .join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="card bg-base-100 border">
            <div className="card-body">
              <h2 className="font-bold text-lg">Examens laboratoire</h2>
              {patient.demandesLabo.map((d: any) => (
                <div key={d.id} className="p-3 border rounded-xl mb-2">
                  <b>{d.numero}</b> · {fmt(d.dateDemande)} · {d.statut}
                  <div>
                    {d.lignes.map((l: any) => l.examen.nom).join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="card bg-base-100 border">
            <div className="card-body">
              <h2 className="font-bold text-lg">Imagerie</h2>
              {patient.demandesImagerie.map((d: any) => (
                <div key={d.id} className="p-3 border rounded-xl mb-2">
                  <b>{d.numero}</b> · {d.examen.nom} · {d.statut} ·{" "}
                  {fmt(d.dateDemande)}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
