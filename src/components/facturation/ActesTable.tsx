"use client";
import { useState } from "react";
import { createActeMedical } from "@/app/actions/facturation";
export default function ActesTable({ actes }: { actes: any[] }) {
  const [open, setOpen] = useState(false); const [form, setForm] = useState({ code: "", libelle: "", categorie: "", montant: "", devise: "USD" }); const [message, setMessage] = useState("");
  async function save() { const r = await createActeMedical({ ...form, montant: Number(form.montant) }); setMessage(r.message); if (r.success) { setOpen(false); location.reload(); } }
  return <div className="space-y-4"><div className="flex justify-between"><div><h1 className="text-3xl font-bold">Actes médicaux</h1><p className="opacity-60">Catalogue des prestations facturables.</p></div><button className="btn btn-primary" onClick={() => setOpen(true)}>+ Nouvel acte</button></div>{message && <div className="alert alert-info">{message}</div>}
    <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100"><table className="table table-zebra"><thead><tr><th>Code</th><th>Libellé</th><th>Catégorie</th><th>Montant</th><th>État</th></tr></thead><tbody>{actes.map(a => <tr key={a.id}><td>{a.code}</td><td>{a.libelle}</td><td>{a.categorie || "-"}</td><td>{Number(a.montant).toFixed(2)} {a.devise}</td><td><span className={`badge ${a.actif ? "badge-success" : "badge-ghost"}`}>{a.actif ? "Actif" : "Inactif"}</span></td></tr>)}</tbody></table></div>
    {open && <dialog open className="modal"><div className="modal-box space-y-3"><h3 className="text-lg font-bold">Nouvel acte médical</h3>{[["code","Code"],["libelle","Libellé"],["categorie","Catégorie"],["montant","Montant"]].map(([k,l]) => <label key={k} className="form-control"><span className="label-text">{l}</span><input className="input input-bordered" type={k === "montant" ? "number" : "text"} value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} /></label>)}<div className="modal-action"><button className="btn" onClick={() => setOpen(false)}>Annuler</button><button className="btn btn-primary" onClick={save}>Enregistrer</button></div></div></dialog>}
  </div>;
}
