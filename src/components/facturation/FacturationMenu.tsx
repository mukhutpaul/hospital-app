import Link from "next/link";

export default function FacturationMenu() {
  return <nav className="flex flex-wrap gap-2 p-3 border-b bg-base-100">
    <Link className="btn btn-ghost" href="/facturation">Vue d'ensemble</Link>
    <Link className="btn btn-ghost" href="/facturation/actes">Actes médicaux</Link>
    <Link className="btn btn-ghost" href="/facturation/factures">Factures</Link>
    <Link className="btn btn-ghost" href="/facturation/lignes">Lignes</Link>
    <Link className="btn btn-ghost" href="/facturation/paiements">Paiements</Link>
  </nav>;
}
