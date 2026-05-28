# UIUXA React Preview

This directory is the first safe React migration pass for the UIUXA dashboard.
It does not replace the production `index.html` yet.

## Scope

- Board posting and deletion
- Student progress editing
- Shared `/api/dashboard-state` load/save service
- Public save flow that matches the Netlify function behavior

## Run Locally

Install dependencies, then start Vite:

```bash
npm install
npm run dev
```

The production app is still served from the repository root. Switch Netlify to
this React app only after the remaining tabs are migrated and verified.
