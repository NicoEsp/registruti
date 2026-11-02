import type { Metadata } from "next";

// El back office es un client component; la metadata vive en este layout.
// Además del noindex de acá, vercel.json le pone X-Robots-Tag.
export const metadata: Metadata = {
  title: "Back office",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
