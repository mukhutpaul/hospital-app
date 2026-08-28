import { getSortieById } from "@/app/actions/sorties";
import { notFound } from "next/navigation";
import SortieForm from "@/components/hospitalisation/SortieForm";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const r = await getSortieById(Number((await params).id));
  if (!r.success || !r.data) return notFound();
  return (
    <main className="mx-auto max-w-3xl p-6">
      <SortieForm initial={r.data} />
    </main>
  );
}
