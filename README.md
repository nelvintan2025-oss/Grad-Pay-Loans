# Grad Pay & Loans

A Vue 3 + Vite website built from Jack's COR1305 Excel work (Learning Tab (2), Data-L (2) and the Sensitivity Analysis sheet).

Pages:
- **/forecast**: salary forecast for any NUS/NTU/SMU programme and grad year (TREND, RSQ, trend check).
- **/loan**: years to repay a student loan (NPER), max-tenure PMT, Table A1 and Table B as live heatmaps.
- **/compare**: every programme ranked by forecast pay.
- **/method**: the Excel formulas behind each number.

All calculations live in `src/lib/calc.js`. Data is in `src/data/ges.json` (exported from the GES sheet of the group workbook).

## Run locally
Needs Node 18+.
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

## Deploy to Vercel
**Option A: GitHub (recommended, auto-deploys on every push)**
1. Create a new GitHub repo and push this folder to it.
2. Go to https://vercel.com/new, sign in with GitHub, and import the repo.
3. Vercel detects Vite. Keep the defaults (build `npm run build`, output `dist`) and click **Deploy**.

**Option B: Vercel CLI (no GitHub)**
```bash
npm i -g vercel
vercel          # first time: answer the prompts, accept defaults
vercel --prod   # publish to your production URL
```

`vercel.json` already rewrites every path to `index.html`, so links like `/loan` work on refresh.

## Updating the data
Re-export the GES sheet to `src/data/ges.json` (same column order as `columns` in the file). Loan scheme defaults are in `LOAN_SCHEMES` in `src/lib/calc.js`.
