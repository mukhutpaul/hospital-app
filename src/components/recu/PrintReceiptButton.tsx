
"use client";

import { Printer } from "lucide-react";

type Props = {
  label?: string;
};

export default function PrintReceiptButton({
  label = "Imprimer le reçu",
}: Props) {
  function handlePrint() {
    window.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="btn btn-primary print:hidden"
    >
      <Printer size={18} />
      {label}
    </button>
  );
}