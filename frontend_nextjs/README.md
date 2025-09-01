# MedPrescribe Verify (Frontend)

Modern, light-themed, responsive Next.js app for creating and verifying medical prescriptions using browser-based Solana wallets.

## Features

- Doctor and Pharmacist role switching
- Doctor:
  - Create prescription via form
  - Connect Solana wallet and sign canonical message
  - Saves signed prescription locally (localStorage)
  - Quick copy for JSON, message, and signature
- Pharmacist:
  - Paste full JSON or separate fields (message, signature, doctor public key)
  - Lightweight verification (structure/presence). Note: full ed25519 verification requires extra libraries
- No backend required

## Quickstart

1. Install dependencies
   ```bash
   npm install
   ```
2. Run dev server
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000

## Solana Wallet

This app expects a browser-injected Solana wallet (e.g., Phantom). If no wallet is detected, connecting/signing will show an error. For production-grade signature verification, integrate an ed25519 verification library (e.g., tweetnacl) or verify on a backend.

## Theming

Theme colors:
- Primary: #1976d2
- Secondary: #0277bd
- Accent: #43a047

The app uses simple CSS variables and minimal Tailwind utilities.

## Notes

- All prescriptions are stored locally in the browser (localStorage).
- No environment variables are required.
