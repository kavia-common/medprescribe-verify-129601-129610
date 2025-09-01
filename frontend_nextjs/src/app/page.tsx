"use client";

import { useState } from "react";
import RoleSwitcher from "@/components/RoleSwitcher";
import DoctorView from "@/components/DoctorView";
import PharmacistView from "@/components/PharmacistView";
import type { Role } from "@/lib/theme";
import { theme } from "@/lib/theme";

export default function Home() {
  const [role, setRole] = useState<Role>("doctor");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: theme.text }}>
            {role === "doctor" ? "Doctor Workspace" : "Pharmacist Workspace"}
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.muted }}>
            {role === "doctor"
              ? "Create and sign prescriptions using your Solana wallet. Saved locally."
              : "Verify prescriptions using the provided canonical message, signature, and doctor public key."}
          </p>
        </div>
        <RoleSwitcher onChange={setRole} />
      </div>

      {role === "doctor" ? <DoctorView /> : <PharmacistView />}

      <footer className="pt-6">
        <p className="text-xs" style={{ color: theme.muted }}>
          Note: This demo performs lightweight verification only to avoid adding heavy crypto dependencies. For full ed25519 verification,
          integrate a suitable library or server-side verification service.
        </p>
      </footer>
    </div>
  );
}
