# Family Finance PWA — Final Build

A private Progressive Web App for household income, expenses, budgets, investments, debts, goals, recurring bills, and bank-statement imports.

## Final-build capabilities

- Responsive, installable PWA for phone and laptop.
- Add, edit, and delete transactions, accounts, budgets, investments, debts, goals, and recurring items.
- Transaction edits safely reverse the previous account-balance effect before applying the updated values.
- Account deletion is blocked while the account is referenced by transactions, investments, or recurring items.
- Financial payload is encrypted in-browser using AES-GCM.
- Optional Google Drive synchronization uploads the encrypted vault envelope only.
- Google OAuth uses the narrow `https://www.googleapis.com/auth/drive.file` scope.
- The application shell works offline after it is cached.

## Update an existing GitHub Pages deployment

Replace the old repository files with the files in this folder and commit the changes. The service-worker cache identifier has been updated so installed phones and laptops can receive the new build. After deployment, close and reopen the PWA. If an older screen remains, refresh the site once in the browser.

## Before Google Drive sync will work

1. Create a Google Cloud project.
2. Enable **Google Drive API**.
3. Configure the OAuth consent screen.
4. Create an **OAuth 2.0 Client ID → Web application**.
5. Add the exact HTTPS web-app origin as an Authorized JavaScript origin. For local testing, you can also add `http://localhost:8080`.
6. Open `config.js` and replace the placeholder with the OAuth Web Client ID.

No OAuth client secret belongs in this front-end project.

## Local test

Do not double-click `index.html` for Drive/PWA testing. Serve the folder over HTTP:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

Deploy these static files to an HTTPS host such as GitHub Pages. The host serves application code only; finance data remains locally encrypted, and the optional synchronized vault is stored in Google Drive.

## Spouse sharing

The owner can share the encrypted Drive vault from Settings. Both users need the shared Family Finance access code to decrypt the vault.

## Data-safety note

Test the final build with sample data before importing real statements. Keep an exported backup in a private location. If the access code is lost, the encrypted data cannot be recovered.
