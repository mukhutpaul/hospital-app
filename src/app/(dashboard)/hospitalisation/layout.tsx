import type { ReactNode } from "react";
import Link from "next/link";
import { BedDouble, ChevronRight, Hospital } from "lucide-react";
import HospitalisationMenu from "@/components/hospitalisation/HospitalisationMenu";
import HospitalisationFeedback from "@/components/hospitalisation/HospitalisationFeedback";

export default function HospitalisationLayout({ children }: { children: ReactNode }) {
  return (
    <>
    <HospitalisationFeedback />
    <div className="min-h-full bg-base-200/30">
      <div className="mx-auto flex w-full max-w-[1600px] gap-5 p-4 md:p-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
            <div className="border-b border-base-300 p-4">
              <Link href="/hospitalisation" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-content">
                  <Hospital size={21} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold">Hospitalisation</p>
                  <p className="text-xs text-base-content/50">Gestion hospitalière</p>
                </div>
              </Link>
            </div>

            <div className="p-3">
              <HospitalisationMenu />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center gap-2 text-sm text-base-content/50 lg:hidden">
            <BedDouble size={16} />
            <span>Hospitalisation</span>
            <ChevronRight size={15} />
            <span>Menu</span>
          </div>
          {children}
        </div>
      </div>
    </div>
    </>
  );
}
