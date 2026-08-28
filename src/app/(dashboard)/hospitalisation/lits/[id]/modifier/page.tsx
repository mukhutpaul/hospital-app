import { prisma } from "@/lib/prisma";
import { getLitById } from "@/app/actions/lits";
import { notFound } from "next/navigation";
import LitForm from "@/components/hospitalisation/LitForm";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const r = await getLitById(Number((await params).id));
  if (!r.success || !r.data) return notFound();
  const chambres = await prisma.chambre.findMany({
    where: { actif: true },
    orderBy: { numero: "asc" },
  });
  return (
    <main className="mx-auto max-w-3xl p-6">
      <LitForm initial={r.data} chambres={chambres} />
    </main>
  );
}
