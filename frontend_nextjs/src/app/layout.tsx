import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { appMeta } from "@/lib/theme";

export const metadata: Metadata = {
  title: appMeta.title,
  description: appMeta.description,
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Header />
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
