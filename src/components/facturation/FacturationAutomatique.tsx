"use client";
import { useState } from "react";
import { facturerTout } from "@/app/actions/facturation";

export default function FacturationAutomatique() {
  const [loading, setLoading] = useState(false); const [message, setMessage] = useState("");
  async function lancer() { setLoading(true); setMessage(""); try { const r = await facturerTout(); setMessage(r.message); } catch { setMessage("Erreur pendant la facturation automatique."); } finally { setLoading(false); } }
  return <div className="card border border-base-300 bg-base-100 shadow-sm"><div className="card-body space-y-5">
    <div><h1 className="card-title">Facturation automatique</h1><p className="opacity-70">Génère les factures à partir des prestations réellement réalisées.</p></div>
    <div className="grid gap-3 md:grid-cols-4"><div className="rounded-xl border p-4"><b>Laboratoire</b><p className="text-sm opacity-60">Demandes terminées ou avec résultat.</p></div><div className="rounded-xl border p-4"><b>Imagerie</b><p className="text-sm opacity-60">Examens réalisés/terminés.</p></div><div className="rounded-xl border p-4"><b>Pharmacie</b><p className="text-sm opacity-60">Médicaments effectivement dispensés.</p></div><div className="rounded-xl border p-4"><b>Hospitalisation</b><p className="text-sm opacity-60">Journées selon le prix de la chambre.</p></div></div>
    {message && <div className="alert alert-info">{message}</div>}
    <button className="btn btn-primary w-fit" disabled={loading} onClick={lancer}>{loading ? <span className="loading loading-spinner loading-sm" /> : "Lancer la facturation automatique"}</button>
  </div></div>;
}
