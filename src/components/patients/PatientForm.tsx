"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { createPatient, updatePatient } from "@/app/actions/patients";

const fields = [
  ["nom","Nom *"],["postNom","Post-nom"],["prenom","Prénom"],["telephone","Téléphone"],["email","Email"],["profession","Profession"],
  ["lieuNaissance","Lieu de naissance"],["nationalite","Nationalité"],["adresse","Adresse"],["personneContact","Personne à contacter"],["contactTelephone","Téléphone contact"],["contactLien","Lien avec le patient"]
];
export default function PatientForm({ initial }: { initial?: any }) {
  const router = useRouter(); const [loading,setLoading]=useState(false); const [preview,setPreview]=useState(initial?.photo||"");
  async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); const fd=new FormData(e.currentTarget); if(!fd.get("nom")||!fd.get("sexe")){toast.error("Le nom et le sexe sont obligatoires.");return;} setLoading(true); try { const r=initial?await updatePatient(initial.id,fd):await createPatient(fd); if(r.success){await Swal.fire({icon:"success",title:"Opération réussie",text:r.message,timer:1200,showConfirmButton:false}); router.push(initial?`/patients/${initial.id}`:"/patients"); router.refresh();} else toast.error(r.message);} catch{toast.error("Une erreur est survenue.")} finally{setLoading(false)} }
  return <form onSubmit={submit} className="space-y-7">
    <section className="card bg-base-100 border border-base-200 shadow-sm"><div className="card-body">
      <div className="flex items-center justify-between border-b pb-4"><div><h2 className="text-xl font-bold">Identité du patient</h2><p className="text-sm text-base-content/60">Informations administratives et identité.</p></div>{initial&&<span className="badge badge-primary">{initial.numeroDossier}</span>}</div>
      <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-6 pt-2">
        <div className="flex flex-col items-center gap-3"><div className="avatar"><div className="w-36 h-36 rounded-2xl bg-base-200 overflow-hidden ring-2 ring-primary/20">{preview?<img src={preview} className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center text-4xl">👤</div>}</div></div><label className="btn btn-sm btn-outline btn-primary">Choisir une photo<input hidden type="file" name="photoFile" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)setPreview(URL.createObjectURL(f))}}/></label><span className="text-xs text-center text-base-content/50">JPG, PNG ou WEBP · 5 Mo max</span></div>
        <div className="grid md:grid-cols-3 gap-4">{fields.slice(0,3).map(([n,l])=><label key={n} className="form-control"><span className="label-text font-medium">{l}</span><input name={n} defaultValue={initial?.[n]||""} className="input input-bordered" required={n==="nom"}/></label>)}
          <label className="form-control"><span className="label-text font-medium">Sexe *</span><select name="sexe" defaultValue={initial?.sexe||""} className="select select-bordered" required><option value="">Sélectionner</option><option value="M">Masculin</option><option value="F">Féminin</option></select></label>
          <label className="form-control"><span className="label-text font-medium">Date de naissance</span><input type="date" name="dateNaissance" defaultValue={initial?.dateNaissance?new Date(initial.dateNaissance).toISOString().slice(0,10):""} className="input input-bordered"/></label>
          {fields.slice(3).map(([n,l])=><label key={n} className="form-control"><span className="label-text font-medium">{l}</span><input name={n} defaultValue={initial?.[n]||""} className="input input-bordered" type={n==="email"?"email":"text"}/></label>)}
        </div>
      </div>
    </div></section>
    <section className="card bg-base-100 border border-base-200 shadow-sm"><div className="card-body"><h2 className="text-xl font-bold">Informations médicales et civiles</h2><div className="grid md:grid-cols-4 gap-4"><label className="form-control"><span className="label-text">État civil</span><select name="etatCivil" defaultValue={initial?.etatCivil||""} className="select select-bordered"><option value="">--</option><option>Célibataire</option><option>Marié(e)</option><option>Divorcé(e)</option><option>Veuf(ve)</option></select></label><label className="form-control"><span className="label-text">Groupe sanguin</span><select name="groupeSanguin" defaultValue={initial?.groupeSanguin||""} className="select select-bordered"><option value="">--</option>{["A","B","AB","O"].map(x=><option key={x}>{x}</option>)}</select></label><label className="form-control"><span className="label-text">Rhésus</span><select name="rhesus" defaultValue={initial?.rhesus||""} className="select select-bordered"><option value="">--</option><option>+</option><option>-</option></select></label></div></div></section>
    <div className="flex justify-end gap-3"><button type="button" className="btn btn-ghost" onClick={()=>router.back()}>Annuler</button><button disabled={loading} className="btn btn-primary min-w-40">{loading?<span className="loading loading-spinner"/>:initial?"Enregistrer les modifications":"Créer le patient"}</button></div>
  </form>
}
