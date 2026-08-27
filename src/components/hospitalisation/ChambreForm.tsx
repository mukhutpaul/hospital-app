"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { createChambre, updateChambre } from "@/app/actions/chambres";

export default function ChambreForm({ initial, services = [] }: { initial?: any; services?: any[] }) {
  const [f, setF] = useState({ numero: initial?.numero ?? "", type: initial?.type ?? "", etage: initial?.etage ?? "", prixJournalier: initial?.prixJournalier ?? 0, devise: initial?.devise ?? "USD", serviceId: initial?.serviceId ?? "", actif: initial?.actif ?? true });
  const [loading, setLoading] = useState(false);
  const s = (k: string, v: any) => setF(x => ({ ...x, [k]: v }));
  async function submit(e: any) {
    e.preventDefault(); setLoading(true);
    try {
      const r = initial ? await updateChambre(initial.id, { ...f, prixJournalier: Number(f.prixJournalier), serviceId: f.serviceId ? Number(f.serviceId) : null }) : await createChambre({ ...f, prixJournalier: Number(f.prixJournalier), serviceId: f.serviceId ? Number(f.serviceId) : null });
      if (r.success) { toast.success(r.message); setTimeout(() => { location.href = "/hospitalisation/chambres"; }, 700); }
      else toast.error(r.message);
    } catch { toast.error("Une erreur est survenue."); } finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm"><h2 className="text-xl font-bold">{initial ? "Modifier une chambre" : "Nouvelle chambre"}</h2><div className="grid gap-4 md:grid-cols-3"><input required className="input input-bordered" placeholder="Numéro" value={f.numero} onChange={e => s("numero", e.target.value)} /><input className="input input-bordered" placeholder="Type" value={f.type} onChange={e => s("type", e.target.value)} /><input className="input input-bordered" placeholder="Étage" value={f.etage} onChange={e => s("etage", e.target.value)} /><input type="number" step="0.01" className="input input-bordered" placeholder="Prix journalier" value={f.prixJournalier} onChange={e => s("prixJournalier", e.target.value)} /><input className="input input-bordered" placeholder="Devise" value={f.devise} onChange={e => s("devise", e.target.value)} /><select className="select select-bordered" value={f.serviceId} onChange={e => s("serviceId", e.target.value)}><option value="">Service</option>{services.map(x => <option key={x.id} value={x.id}>{x.nom}</option>)}</select></div><div className="flex justify-end gap-2"><a href="/hospitalisation/chambres" className="btn btn-ghost">Annuler</a><button className="btn btn-primary" disabled={loading}>{loading ? "..." : "Enregistrer"}</button></div></form>;
}
