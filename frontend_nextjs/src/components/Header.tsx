"use client";

import Link from "next/link";
import { theme } from "@/lib/theme";

export default function Header() {
  return (
    <header
      className="w-full border-b"
      style={{ borderColor: theme.border, background: theme.surface }}
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="inline-block h-8 w-8 rounded-lg"
            style={{ background: theme.primary }}
          />
          <div>
            <h1 className="text-lg font-semibold" style={{ color: theme.text }}>
              MedPrescribe Verify
            </h1>
            <p className="text-xs" style={{ color: theme.muted }}>
              Solana wallet signed prescriptions
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="px-3 py-2 rounded-md font-medium"
            style={{ color: theme.text }}
          >
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
