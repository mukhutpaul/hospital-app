"use client";
import { useEffect, useState } from "react";
import { enregistrerPaiement, getFactureFinance } from "@/app/actions/finance";
import { useRouter, useSearchParams } from "next/navigation";

export default function FinancePaymentForm() {
  const router = useRouter();
  const params = useSearchParams();
  const factureId = Number(params.get("factureId"));
  const [facture, setFacture] = useState<any>(null);
  const [montant, setMontant] = useState("");
  const [modePaiement, setModePaiement] = useState("ESPECES");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!factureId) return;
    getFactureFinance(factureId).then(setFacture);
  }, [factureId]);

  async function submit() {
    setMessage(""); setSaving(true);
    const r = await enregistrerPaiement({ factureId, montant: Number(montant), modePaiement });
    setSaving(false);
    if (!r.success) return setMessage(r.message);
    router.push(`/facturation/factures/${factureId}`);
  }

  if (!facture) return <div className="p-6">Chargement de la facture…</div>;
  return <div className="mx-auto max-w-3xl p-6 space-y-5">
    <div><h1 className="text-3xl font-bold">Nouveau paiement</h1><p className="opacity-60">Le paiement est strictement rattaché à la facture et à son parcours médical.</p></div>
    <div className="card bg-base-100 border border-base-300 shadow-sm"><div className="card-body space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div><b>Patient</b><div>{facture.patient.nom} {facture.patient.postNom || ""} {facture.patient.prenom || ""}</div><small>{facture.patient.numeroDossier}</small></div>
        <div><b>Facture</b><div>{facture.numero}</div><small>{facture.devise}</small></div>
        <div><b>Consultation</b><div>{facture.consultation ? `CONS-${facture.consultation.idConsultation}` : "Non liée"}</div></div>
        <div><b>Service</b><div>{facture.consultation?.service?.nom || "—"}</div></div>
      </div>
      <div className="stats stats-vertical md:stats-horizontal shadow border">
        <div className="stat"><div className="stat-title">Net à payer</div><div className="stat-value text-lg">{facture.montantTotal} {facture.devise}</div></div>
        <div className="stat"><div className="stat-title">Déjà payé</div><div className="stat-value text-lg">{facture.montantPaye} {facture.devise}</div></div>
        <div className="stat"><div className="stat-title">Reste</div><div className="stat-value text-lg">{facture.reste} {facture.devise}</div></div>
      </div>
      <label className="form-control"><span className="label-text font-medium">Montant *</span><input className="input input-bordered" type="number" min="0.01" step="0.01" max={facture.reste} value={montant} onChange={e=>setMontant(e.target.value)} /></label>
      <label className="form-control"><span className="label-text font-medium">Mode de paiement *</span><select className="select select-bordered" value={modePaiement} onChange={e=>setModePaiement(e.target.value)}><option>ESPECES</option><option>MOBILE_MONEY</option><option>BANQUE</option><option>CARTE</option><option>CHEQUE</option></select></label>
      {message && <div className="alert alert-error">{message}</div>}
      <div className="flex justify-end gap-2"><button className="btn btn-ghost" onClick={()=>router.back()}>Annuler</button><button className="btn btn-primary" disabled={saving || facture.reste<=0} onClick={submit}>{saving ? "Enregistrement…" : "Enregistrer le paiement"}</button></div>
    </div></div>
  </div>;
}
