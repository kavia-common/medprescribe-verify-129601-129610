import { theme } from "@/lib/theme";
import { ReactNode, TextareaHTMLAttributes } from "react";

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="text-sm font-medium mb-1 block" style={{ color: theme.muted }}>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 text-sm ${props.className || ""}`}
      style={{
        borderColor: theme.border,
        background: theme.surface,
        color: theme.text,
        boxShadow: "none",
      }}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 text-sm min-h-[96px] ${props.className || ""}`}
      style={{
        borderColor: theme.border,
        background: theme.surface,
        color: theme.text,
        boxShadow: "none",
      }}
    />
  );
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const { variant = "primary", className, ...rest } = props;
  const styles =
    variant === "primary"
      ? { background: theme.primary, color: "#fff", borderColor: theme.primary }
      : variant === "secondary"
      ? { background: theme.accent, color: "#fff", borderColor: theme.accent }
      : { background: "transparent", color: theme.text, borderColor: theme.border };

  return (
    <button
      {...rest}
      className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${className || ""}`}
      style={styles}
    />
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: theme.border, background: theme.surface }}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>
      {children}
    </h2>
  );
}

export function Helper({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs" style={{ color: theme.muted }}>
      {children}
    </p>
  );
}
