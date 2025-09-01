"use client";

import { useEffect, useState } from "react";
import { loadRole, saveRole } from "@/lib/storage";
import type { Role } from "@/lib/theme";
import { theme } from "@/lib/theme";

type Props = {
  onChange?: (role: Role) => void;
};

export default function RoleSwitcher({ onChange }: Props) {
  const [role, setRole] = useState<Role>("doctor");

  useEffect(() => {
    const r = loadRole();
    setRole(r);
  }, []);

  useEffect(() => {
    saveRole(role);
    onChange?.(role);
  }, [role, onChange]);

  return (
    <div
      className="inline-flex p-1 rounded-lg border"
      style={{ borderColor: theme.border, background: theme.surface }}
      role="tablist"
      aria-label="Role switcher"
    >
      {(["doctor", "pharmacist"] as Role[]).map((r) => {
        const active = r === role;
        return (
          <button
            key={r}
            role="tab"
            aria-selected={active}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            onClick={() => setRole(r)}
            style={{
              background: active ? theme.primary : "transparent",
              color: active ? "#ffffff" : theme.text,
            }}
          >
            {r === "doctor" ? "Doctor" : "Pharmacist"}
          </button>
        );
      })}
    </div>
  );
}
