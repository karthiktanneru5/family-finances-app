# Family Finance — Phase 1

Local-first personal finance PWA for phone and laptop.

## Phase 1 features

- Encrypted AES-GCM vault stored in browser IndexedDB
- No Google Drive connection required
- Manual transactions, accounts, budgets, investments, debts, goals, and recurring items
- Edit/delete support across major records
- Monthly dashboard selector with income, expenses, savings, cash flow, 50/30/20, spending trend, spending by category, net worth, goals, and reminders
- CSV bank-statement analysis with automatic column detection
- Text-based PDF bank-statement analysis using pinned PDF.js 6.1.200 loaded in the browser
- Merchant normalization and rule learning
- Salary, subscription, investment-transfer, recurring transaction, and card-payment detection
- Duplicate detection
- Review-before-import workflow
- Encrypted backup export and restore

## Statement guidance

CSV is strongly recommended because bank PDFs vary significantly in layout. PDF import is best-effort for text-based PDFs. Image-only/scanned PDFs are not supported in this build.

PDF parsing uses Mozilla PDF.js 6.1.200 from jsDelivr. The PDF bytes are passed to PDF.js in the browser; this app does not upload statements to an application server.

## Important balance behavior

During statement import, the default is **Do not change account balance**. This is intentional: if the account balance you entered is a current balance, applying six months of historical transactions would distort it. Choose the adjustment option only when the account opening balance corresponds to the beginning of the imported statement period.

## Publishing to GitHub Pages

Upload these files to the root of the existing `family-finance-app` repository and replace the old versions:

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `README.md`
- `icons/`

`config.js` and `drive-sync.js` are no longer required in Phase 1.
