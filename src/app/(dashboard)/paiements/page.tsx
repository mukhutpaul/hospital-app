import Link from "next/link";
import { getPaiements } from "@/app/actions/finance";
export default async function Page(){
 const paiements=await getPaiements();
 return <div className="p-6 space-y-5"><div className="flex justify-between"><div><h1 className="text-3xl font-bold">Paiements</h1><p className="opacity-60">Tous les encaissements restent rattachés à une facture, un patient et, lorsque disponible, une consultation.</p></div><Link href="/paiements/nouveau" className="btn btn-primary">Nouveau paiement</Link></div>
 <div className="card border bg-base-100"><div className="card-body overflow-x-auto"><table className="table"><thead><tr><th>Référence</th><th>Patient</th><th>Consultation</th><th>Facture</th><th>Mode</th><th>Montant</th><th>Date</th><th></th></tr></thead><tbody>{paiements.map((p:any)=><tr key={p.id}><td>{p.reference}</td><td>{p.patient.nom} {p.patient.postNom||""} {p.patient.prenom||""}<div className="text-xs opacity-60">{p.patient.numeroDossier}</div></td><td>{p.facture?.consultation ? `CONS-${p.facture.consultation.idConsultation}` : "—"}</td><td>{p.facture?.numero||"—"}</td><td>{p.modePaiement}</td><td>{p.montant} {p.devise}</td><td>{new Date(p.datePaiement).toLocaleString("fr-FR")}</td><td><a className="btn btn-sm btn-outline" href={`/paiements/${p.id}/print`}>Reçu</a></td></tr>)}</tbody></table></div></div></div>;
}
