"use client";
import { useState } from "react";
import { convertirProformaEnFacture } from "@/app/actions/finance";
import { useRouter } from "next/navigation";
export default function ConvertProformaButton({id}:{id:number}){const [loading,setLoading]=useState(false);const router=useRouter();async function go(){setLoading(true);const r=await convertirProformaEnFacture(id);setLoading(false);if(r.success) router.push(`/facturation/factures/${(r.data as any).id}`); else alert(r.message);}return <button className="btn btn-primary" disabled={loading} onClick={go}>{loading?"Validation…":"Transformer en facture"}</button>}
