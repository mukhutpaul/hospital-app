import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import AuthSessionProvider from "@/components/providers/SessionProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AuthSessionProvider>
      <div className="flex min-h-screen bg-base-200">
        
        {/* SIDEBAR */}
        <Sidebar />

        {/* CONTENU */}
        <div className="flex flex-1 flex-col min-w-0">
          
          {/* HEADER */}
          <Header />

          {/* PAGE */}
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
            {children}
          </main>

        </div>
      </div>
    </AuthSessionProvider>
  );
}