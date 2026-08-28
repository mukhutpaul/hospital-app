import ActesMedicauxSidebar from "./ActesMedicauxSidebar";



export default function ActesMedicauxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base-200/30">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 p-4 md:p-6 lg:flex-row">
        <ActesMedicauxSidebar />

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
