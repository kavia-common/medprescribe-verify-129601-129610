"use client";

import { useState } from "react";
import { Button, Card, Helper, Input, Label, SectionTitle, TextArea } from "./ui";
import { theme } from "@/lib/theme";
import { verifySignatureBase64 } from "@/lib/solana";

type Parsed = {
  message: string;
  signature: string;
  doctorPublicKey: string;
  parsedOk: boolean;
  error?: string;
};

export default function PharmacistView() {
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [doctorPk, setDoctorPk] = useState("");
  const [result, setResult] = useState<{ ok: boolean; reason: string } | null>(null);

  const parseFromJson = (): Parsed => {
    try {
      const obj = JSON.parse(raw);
      const msg = obj?.message;
      const sig = obj?.signature;
      const pk = obj?.payload?.doctorPublicKey || obj?.doctorPublicKey;
      if (!msg || !sig || !pk) throw new Error("Missing fields in JSON (require message, signature, payload.doctorPublicKey).");
      return { message: msg, signature: sig, doctorPublicKey: pk, parsedOk: true };
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Invalid JSON";
      return { message: "", signature: "", doctorPublicKey: "", parsedOk: false, error: errMsg };
    }
  };

  const onVerifyFromJson = () => {
    const parsed = parseFromJson();
    if (!parsed.parsedOk) {
      setResult({ ok: false, reason: parsed.error || "Invalid input" });
      return;
    }
    const r = verifySignatureBase64(parsed.message, parsed.signature, parsed.doctorPublicKey);
    setResult({ ok: r.verified, reason: r.reason });
  };

  const onVerifyManual = () => {
    const r = verifySignatureBase64(message, signature, doctorPk);
    setResult({ ok: r.verified, reason: r.reason });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <SectionTitle>Verify via JSON</SectionTitle>
        <Helper>Paste the full JSON object you received from the doctor (includes message, signature, and payload).</Helper>
        <div className="mt-3 space-y-3">
          <TextArea placeholder='{"message":"...","signature":"...","payload":{"doctorPublicKey":"..."}}' value={raw} onChange={(e) => setRaw(e.target.value)} />
          <div className="flex items-center gap-2">
            <Button onClick={onVerifyFromJson}>Verify</Button>
            <Button variant="ghost" onClick={() => setRaw("")}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle>Verify via Fields</SectionTitle>
        <Helper>Alternatively paste fields separately if the JSON is not available.</Helper>
        <div className="mt-3 space-y-3">
          <div>
            <Label>Canonical Message</Label>
            <TextArea placeholder="Canonical JSON message" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div>
            <Label>Signature (base64)</Label>
            <Input placeholder="Base64 signature" value={signature} onChange={(e) => setSignature(e.target.value)} />
          </div>
          <div>
            <Label>Doctor Public Key (base58)</Label>
            <Input placeholder="Base58 public key" value={doctorPk} onChange={(e) => setDoctorPk(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onVerifyManual}>Verify</Button>
            <Button variant="ghost" onClick={() => { setMessage(""); setSignature(""); setDoctorPk(""); }}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <div className="lg:col-span-2">
        <Card>
          <SectionTitle>Verification Result</SectionTitle>
          {!result && <p className="text-sm" style={{ color: theme.muted }}>No verification performed yet.</p>}
          {result && (
            <div className="mt-2 rounded-md border p-3" style={{ borderColor: theme.border, background: result.ok ? "#ecfdf5" : "#fef2f2" }}>
              <p className="font-medium" style={{ color: theme.text }}>
                {result.ok ? "Presumed valid (fields present)" : "Verification incomplete"}
              </p>
              <p className="text-sm mt-1" style={{ color: theme.muted }}>
                {result.reason}
              </p>
              <Helper>
                For production-grade verification, integrate an ed25519 verification library (e.g., tweetnacl) or server-side verification.
              </Helper>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
