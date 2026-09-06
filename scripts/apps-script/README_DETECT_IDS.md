How to find `APPS_SCRIPT_ID` and `DEPLOYMENT_ID`

1. Find `APPS_SCRIPT_ID` (project/script id)

- In the Apps Script editor, open your project. The editor URL looks like:
  `https://script.google.com/home/projects/PROJECT_ID/editor` — the `PROJECT_ID` is the `APPS_SCRIPT_ID`.
- Or run `npx clasp clone <scriptId>` if you already know the id.

2. Find `DEPLOYMENT_ID` (existing webapp deployment)

- If you used the Apps Script editor to create a deployment, open "Deployments" in the left sidebar — each deployment shows an ID.
- Using `clasp`:

  ```bash
  # list deployments (shows id and version)
  npx clasp deployments --rootDir scripts/apps-script/webapp
  ```

- Or use the helper script (service account required):

  ```bash
  # set env vars or have ./gac.json with service account creds
  export GOOGLE_SERVICE_ACCOUNT="$(cat ./gac.json)"
  export APPS_SCRIPT_ID=YOUR_SCRIPT_ID
  node scripts/apps-script/list-deployments.mjs
  ```

3. Set `VITE_APPS_SCRIPT_BASE`

- Take the web app URL from the deployment (it looks like `https://script.google.com/macros/s/DEPLOYMENT_ID/exec`) and set it in your repo's `.env`:

  ```bash
  VITE_APPS_SCRIPT_BASE=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
  ```

Notes

- For GitHub Actions CI we expect `GOOGLE_SERVICE_ACCOUNT`, `APPS_SCRIPT_ID`, and `APPS_SCRIPT_DEPLOYMENT_ID` in repository secrets.
