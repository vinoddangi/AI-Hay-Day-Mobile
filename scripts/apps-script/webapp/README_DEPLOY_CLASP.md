Prepare and deploy the SPA into the Apps Script project using clasp

Prereqs

- Install Node & npm
- Install clasp globally: `npm i -g @google/clasp`
- `clasp login` and authorize your Google account

Steps

1. Build the client:

```
npm install
npm run build
```

2. Copy `dist` into the Apps Script webapp folder (this repo helper):

```
node scripts/copy-dist-to-webapp.js
```

3. Initialize or clone your Apps Script project locally (one-time):

To create new project and link:

```
clasp create --type webapp --title "AI-Hay-Day Webapp" --rootDir scripts/apps-script/webapp
```

Or to use an existing project (pull files locally):

```
clasp clone <PROJECT_ID> --rootDir scripts/apps-script/webapp
```

4. Push the webapp files to Apps Script:

```
clasp push --rootDir scripts/apps-script/webapp
```

5. Deploy in the Apps Script editor:

- Open the project in script.google.com (or `clasp open`)
- Deploy -> New deployment -> Web app
- Execute as: Me
- Who has access: Anyone (or Anyone, even anonymous)

Notes

- The copy script rewrites `/assets/` references to `assets/` so static files are served from the project.
- Apps Script has project size limits — if your build is large, this approach may fail.
- For iterative dev, continue using `vite dev` locally; only push production builds to Apps Script.
