# Family Finance V2 — Ready to Use

This is the local-first V2 release.

## Included
- Responsive phone/laptop PWA
- Encrypted IndexedDB storage
- Accounts, transactions, investments, debts, goals, budgets and recurring bills
- Edit/delete throughout
- Monthly dashboard and 50/30/20 tracking
- CSV statement analysis and review-before-approve workflow
- Best-effort text-based PDF import
- Automatic salary/subscription/recurring/transfer/category detection
- Duplicate detection
- Learned merchant rules with a Rules screen
- Reports: cash flow, top merchants, categories, and 50/30/20 history
- USD and INR
- Encrypted backup/restore
- No Google Drive or bank credentials required

## Publish to your existing GitHub Pages app
1. Extract this ZIP.
2. Upload `index.html`, `manifest.webmanifest`, `sw.js`, `README.md`, and the `icons` folder to the root of your existing `family-finance-app` repository.
3. Replace the old files when GitHub asks.
4. Delete old `config.js` and `drive-sync.js` if they still exist.
5. Commit directly to `main`.
6. Open **Actions** and wait for the Pages deployment to show a green check.
7. Open the live site and hard refresh (`Cmd+Shift+R` on Mac, `Ctrl+Shift+R` on Windows).

## First real-use workflow
1. Create your access code.
2. Add all accounts with current balances.
3. Import ONE CSV statement first.
4. Review transaction count, totals and classifications before approval.
5. Approve it and compare the dashboard with the statement.
6. Export an encrypted backup.
7. Then import the remaining statements.

CSV is strongly preferred. Text-based PDFs are best-effort; scanned/image PDFs are not reliably supported.
