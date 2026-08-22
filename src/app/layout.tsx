import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "./ToastProvider";

export const metadata: Metadata = {
  title: "Hospital Management System",
  description: "Système de gestion hospitalière",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        {children}

        <ToastProvider />
      </body>
    </html>
  );
}