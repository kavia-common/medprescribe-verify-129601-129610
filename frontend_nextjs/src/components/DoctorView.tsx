"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Helper, Input, Label, SectionTitle, TextArea } from "./ui";
import { connectWallet, signMessage, sendMemoTransaction, getSolanaRpcUrl } from "@/lib/solana";
import { addPrescription, listPrescriptions, SignedPrescription, updatePrescriptionMemoSig } from "@/lib/storage";
import { theme } from "@/lib/theme";

type MedRow = { name: string; dosage: string; instructions: string };

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function DoctorView() {
  const [patientName, setPatientName] = useState("");
  const [patientDOB, setPatientDOB] = useState("");
  const [notes, setNotes] = useState("");
  const [meds, setMeds] = useState<MedRow[]>([{ name: "", dosage: "", instructions: "" }]);
  const [isSigning, setIsSigning] = useState(false);
  const [walletPk, setWalletPk] = useState<string>("");
  const [error, setError] = useState<string>("");


  const history = useMemo(() => listPrescriptions(), []);

  const addMedRow = () => setMeds((m) => [...m, { name: "", dosage: "", instructions: "" }]);
  const updateMed = (idx: number, key: keyof MedRow, value: string) =>
    setMeds((m) => m.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  const removeMed = (idx: number) => setMeds((m) => m.filter((_, i) => i !== idx));

  const canonicalMessage = useCallback(() => {
    const cleanMeds = meds.filter((m) => m.name || m.dosage || m.instructions);
    const payload = {
      patientName,
      patientDOB,
      medications: cleanMeds,
      notes,
      issuedAt: new Date().toISOString(),
    };
    // Create stable canonical JSON
    const canonical = JSON.stringify(payload);
    return { payload, canonical };
  }, [patientName, patientDOB, meds, notes]);

  useEffect(() => {
    // attempt to auto-connect to display pk (non-intrusive)
    (async () => {
      try {
        const info = await connectWallet();
        setWalletPk(info.publicKey);
      } catch {
        // ignore
      }
    })();
  }, []);

  const onConnect = async () => {
    setError("");
    try {
      const info = await connectWallet();
      setWalletPk(info.publicKey);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to connect wallet.";
      setError(msg);
    }
  };

  const onSign = async () => {
    setError("");
    setIsSigning(true);
    try {
      const { payload, canonical } = canonicalMessage();
      if (!payload.patientName || !payload.patientDOB || payload.medications.length === 0) {
        throw new Error("Please provide patient details and at least one medication.");
      }
      const { signature, publicKey } = await signMessage(canonical);

      const memoText = JSON.stringify({
        v: 1,
        kind: "prescription",
        data: { ...payload, doctorPublicKey: publicKey },
      });

      const signed: SignedPrescription = {
        id: uuid(),
        payload: { ...payload, doctorPublicKey: publicKey },
        signature,
        message: canonical,
      };

      // Save immediately for UX
      addPrescription(signed);

      // Broadcast memo transaction carrying the prescription data (use configured RPC)
      const txSig = await sendMemoTransaction(publicKey, memoText, getSolanaRpcUrl());

      // Update saved record with the tx signature for reference
      updatePrescriptionMemoSig(signed.id, txSig);

      // Reset form minimal
      setNotes("");
      setMeds([{ name: "", dosage: "", instructions: "" }]);
      alert(`Prescription signed, memo sent on-chain.\nTransaction: ${txSig}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to sign or send memo transaction.";
      // Provide UX hint if common debit error is detected
      const hint = typeof msg === "string" && msg.includes("Attempt to debit an account but found no record of a prior credit")
        ? "\n\nAction: Use the devnet faucet or explorer to airdrop SOL to your wallet, then retry."
        : "";
      setError(`${msg}${hint}`);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <SectionTitle>Create Prescription</SectionTitle>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm" style={{ color: theme.muted }}>
              Wallet: {walletPk ? walletPk : "Not connected"}
            </p>
          </div>
          <Button onClick={onConnect} variant={walletPk ? "ghost" : "secondary"}>
            {walletPk ? "Wallet Connected" : "Connect Wallet"}
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <Label>Patient Name</Label>
            <Input placeholder="Jane Doe" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
          </div>
          <div>
            <Label>Patient Date of Birth</Label>
            <Input type="date" value={patientDOB} onChange={(e) => setPatientDOB(e.target.value)} />
          </div>

          <div>
            <Label>Medications</Label>
            <div className="space-y-2">
              {meds.map((m, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                  <Input placeholder="Name" value={m.name} onChange={(e) => updateMed(idx, "name", e.target.value)} />
                  <Input placeholder="Dosage" value={m.dosage} onChange={(e) => updateMed(idx, "dosage", e.target.value)} />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Instructions"
                      value={m.instructions}
                      onChange={(e) => updateMed(idx, "instructions", e.target.value)}
                    />
                    <Button type="button" variant="ghost" onClick={() => removeMed(idx)} aria-label="Remove medication">
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
              <div>
                <Button type="button" variant="ghost" onClick={addMedRow}>
                  + Add medication
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <TextArea placeholder="Additional instructions or notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Helper>Notes are optional.</Helper>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-2">
            <Button onClick={onSign} disabled={isSigning}>
              {isSigning ? "Signing..." : "Sign, Memo & Save"}
            </Button>
            <Helper>Your wallet will sign the canonical JSON and submit a Memo transaction with the prescription data. Ensure your devnet wallet has some SOL for fees (use the faucet if needed).</Helper>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle>Prescription History (Local)</SectionTitle>
        <Helper>Stored in your browser only. Each entry may include an on-chain memo transaction signature.</Helper>
        <div className="mt-3 space-y-3 max-h-[520px] overflow-auto pr-1">
          {history.length === 0 && <p className="text-sm" style={{ color: theme.muted }}>No prescriptions saved yet.</p>}
          {history.map((p) => (
            <div key={p.id} className="rounded-lg border p-3" style={{ borderColor: theme.border }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: theme.text }}>
                    {p.payload.patientName} — {new Date(p.payload.issuedAt).toLocaleString()}
                  </p>
                  <p className="text-xs" style={{ color: theme.muted }}>
                    Doctor PK: {p.payload.doctorPublicKey}
                  </p>
                  {p.payload.memoTxSig && (
                    <p className="text-xs mt-1" style={{ color: theme.muted }}>
                      Memo Tx: <a className="underline" href={`https://explorer.solana.com/tx/${p.payload.memoTxSig}`} target="_blank" rel="noreferrer">{p.payload.memoTxSig}</a>
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <CopyButton label="Copy JSON" content={JSON.stringify(p, null, 2)} />
                  <CopyButton label="Copy Message" content={p.message} />
                  <CopyButton label="Copy Signature" content={p.signature} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CopyButton({ content, label }: { content: string; label: string }) {
  const [ok, setOk] = useState(false);
  const onCopy = async () => {
    await navigator.clipboard.writeText(content);
    setOk(true);
    setTimeout(() => setOk(false), 1000);
  };
  return (
    <button
      onClick={onCopy}
      className="px-3 py-1 rounded-md text-xs border"
      style={{ borderColor: theme.border, color: theme.text, background: ok ? theme.accent : "transparent" }}
      aria-live="polite"
    >
      {ok ? "Copied" : label}
    </button>
  );
}
