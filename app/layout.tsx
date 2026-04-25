import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Legacy Project Architect — Williamsburg Academy",
  description: "Transform static curriculum into AI-driven historical simulations. Bring Socrates, Washington, and Cicero into the modern classroom.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ivory text-slate-blue antialiased">
        {children}
      </body>
    </html>
  );
}
