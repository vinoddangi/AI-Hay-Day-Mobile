Setup and deploy Apps Script web app for entity-based Google Sheets APIs

1. Create four Google Sheets: Sales, Purchase, Cash, Credit. Note their spreadsheet IDs from the URL.

Notes on structure:

- All entities (Sales, Purchase, Cash, Credit) now use monthly tabs named `YYYY-MM` in their respective spreadsheets.
- When you POST to an entity (e.g., `/sales`), the Apps Script will append to the current month's tab (or the month provided in `payload.date`). If the month's tab doesn't exist it will be created.
  - `Purchase` already used this behavior; Sales/Cash/Credit now follow the same pattern.

2. Open the Apps Script editor (https://script.google.com/) and create a new project, then paste `app.gs` contents.

3. In the Apps Script project, open Project Settings -> Script properties and add these keys:
   - `SHEET_ID_SALES` = <Sales spreadsheet ID>
   - `SHEET_ID_PURCHASE` = <Purchase spreadsheet ID>
   - `SHEET_ID_CASH` = <Cash spreadsheet ID>
   - `SHEET_ID_CREDIT` = <Credit spreadsheet ID>

4. Save and Deploy -> New deployment -> Select type: Web app
   - Execute as: Me
   - Who has access: Anyone (or Anyone, even anonymous) depending on your needs

5. Copy the web app URL. In the client app (Vite), set environment variable `VITE_APPS_SCRIPT_BASE` to the web app base URL (without trailing slash). Example in `.env`:

```
VITE_APPS_SCRIPT_BASE=https://script.google.com/macros/s/AKfycbxxx/exec
```

6. Notes about CORS: Apps Script web apps do not allow custom response headers. If you call the web app directly from the browser and encounter CORS issues, either:
   - Call the web app from a server-side proxy you control, or
   - Use the web app from environments that don't enforce CORS (e.g., server-to-server), or
   - Deploy the App Script as a Google Cloud Function / Cloud Run service for full CORS control.

7. Client usage: use the `AppsScriptService` in `src/services/appsScriptService.ts` to POST to `/sales`, `/purchase`, `/cash`, `/credit`.
