Service account & IAM steps for CI deploy

1. Enable APIs

- In the Google Cloud Console for the project that owns your Apps Script project, enable:
  - Google Apps Script API
  - Google Drive API (if your script manipulates Drive/Sheets)

2. Create a service account

- Console: IAM & Admin → Service accounts → Create service account.
- Give it a descriptive name (e.g. `ai-hay-day-deployer`).

3. Grant access to the Apps Script project

- Open the Apps Script editor for your project and share the project with the service account's email (add as Editor). This allows the service account to push and deploy.

4. (Optional) IAM role

- If you prefer project-level IAM: grant the service account the `Editor` role on the GCP project. This is broader but simple.
- For tighter permissions, ensure the account has permission to call the Apps Script API and manage the project; sharing the script project with Editor is usually sufficient.

5. Create & download JSON key

- While viewing the service account, create a new JSON key and download it. Save as `gac.json` locally for testing, but DO NOT commit this file.

6. Add GitHub secrets

- In your GitHub repo, add the following secrets:
  - `GOOGLE_SERVICE_ACCOUNT` — paste the full JSON contents of the service account key
  - `APPS_SCRIPT_ID` — your Apps Script project id (from the editor URL)
  - `APPS_SCRIPT_DEPLOYMENT_ID` — the deployment id to update (optional; see README_DETECT_IDS.md)

7. Test locally (optional)

- Put `gac.json` in the repo root (temporary, do not commit). Then run locally:

  ```bash
  npm ci
  npm run apps:deploy
  # after success, webapp-url.txt will contain the public URL
  ```

Security notes

- Never commit the service account JSON. Use GitHub secrets only.
- Review the service account permissions and remove excessive roles when finished.
