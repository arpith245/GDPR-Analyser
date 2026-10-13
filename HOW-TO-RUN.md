# GDPR Analyzer Pro — How to Run

A web app that analyzes any website for GDPR / DPDP privacy compliance
(cookies, tracking beacons, security, consent) and generates PDF reports.

## You need (install once)

1. **Node.js v18 or newer** — download from https://nodejs.org
   (the LTS version is fine). Check with: `node --version`

That's it. No database needed — the app stores data in memory while it runs.

## Setup (first time only)

1. **Unzip** this folder anywhere you like.
2. **Open a terminal inside the folder** (the one containing `package.json`):
   - Windows: open the folder, click the address bar, type `powershell`, press Enter.
   - Mac/Linux: right-click the folder → open in Terminal.
3. **Install dependencies** (takes 2–5 minutes, needs internet):
   ```
   npm install
   ```
4. **Install Chrome for the analyzer** (the app controls a headless Chrome
   to scan websites — without this, every analysis shows "failed"):
   ```
   npx puppeteer browsers install chrome
   ```

## Start the app

- **Windows (easiest):** double-click `start-dev.ps1`.
  If Windows blocks it, run this instead from PowerShell in the folder:
  ```
  powershell -ExecutionPolicy Bypass -File start-dev.ps1
  ```
- **Mac / Linux / Git Bash:** run:
  ```
  npm run dev
  ```

Wait until you see `serving on port 5000`, then open in your browser:

**http://localhost:5000**

## Use it

1. Paste any website URL (e.g. `https://example.com`).
2. Pick an analysis type and click Start Analysis.
3. Wait ~30 seconds, review the scores, download the PDF report if you want.

## Stop it

Press `Ctrl + C` in the terminal, or just close the terminal window.

## Troubleshooting

| Problem | Fix |
|---|---|
| Every analysis shows "failed" | You skipped step 4 — run `npx puppeteer browsers install chrome`, then start a fresh analysis |
| `NODE_ENV is not recognized` on Windows | Don't use `npm run dev` in PowerShell/CMD — use `start-dev.ps1` (or Git Bash) instead |
| Port 5000 already in use | Close the other program, or start with a different port: Windows → edit `start-dev.ps1` (`$env:PORT`), Mac/Linux → `PORT=3000 npm run dev` |
| `npm install` fails | Make sure Node.js is v18+ (`node --version`) and you have internet access |

## Project structure (for reference)

- `client/` — React frontend
- `server/` — Express backend + analysis services (`server/services/`)
- `shared/` — shared types/schemas
- `start-dev.ps1` — Windows starter script
