# UIUXA_CC AI Handoff

This file is a handoff note for another AI/chat session. It summarizes the current project state, deployment assumptions, completed work, validation results, and safety notes needed to continue editing this site without losing context.

## Project

- GitHub repository: `https://github.com/khjsbs324/UIUXA_CC`
- Netlify production site: `https://uiuxa-cc.netlify.app/`
- GitHub Pages site: `https://khjsbs324.github.io/UIUXA_CC/`
- Primary deployment target: Netlify

## Current Decision

- Do not replace the production app with React yet.
- Keep the current HTML/CSS/JavaScript app as the production app.
- The experimental `react-app/` directory exists for possible future React migration work.
- Do not delete, stage, or commit `react-app/` unless the user explicitly asks.
- Use Netlify as the source of truth for persistence testing.
- GitHub Pages is static hosting only and cannot run the `/api/dashboard-state` server API.

## Main User Requirements

- Learning board edits must persist after refresh.
- Progress edits must persist after refresh.
- Students must be able to edit the learning board and progress data.
- Student-facing public saves and administrator-level full saves must remain separate.
- Keep the existing UI/UX unless the user explicitly asks for design changes.
- Avoid risky rewrites. Prefer branch-based work, validation, then PR/merge.

## Persistence Model

Persistence should be checked on Netlify, not GitHub Pages.

- Netlify endpoint: `https://uiuxa-cc.netlify.app/api/dashboard-state`
- Student/public save responses were verified with `mode: "public"`.
- GitHub Pages returns 404 for `/api/dashboard-state`.
- Direct Supabase config is disabled in `js/supabase-config.js`, so GitHub Pages cannot persist server-side changes.

Administrator writes use this header shape:

```text
X-Dashboard-Write-Password: <Netlify environment variable or site owner secret>
```

Never commit the real administrator password, token, API key, Supabase service role key, or any other secret to the repository.

## Completed Work

### Student Save Fix

The main branch already includes a fix allowing student/public saves for board/progress-related data.

- Commit: `43b1131 Allow student board and progress saves`
- Purpose: allow student-editable public data such as board items, progress, and comments to persist through the Netlify API.

### JavaScript Refactor

The large `js/app.js` file was split into smaller core/view modules while preserving the existing UI and behavior.

Core modules:

- `js/core/state-utils.js`
- `js/core/backup.js`

View modules:

- `js/views/board.js`
- `js/views/progress.js`
- `js/views/workspace-memo.js`
- `js/views/notices.js`
- `js/views/roadmap-schedule.js`
- `js/views/tool-cards.js`

`js/app.js` now mainly wires modules together and coordinates app flow.

## PR and Merge State

- Refactor branch: `js-refactor-light`
- Pull request: `https://github.com/khjsbs324/UIUXA_CC/pull/1`
- PR title: `[codex] Refactor dashboard JavaScript modules`
- PR status: merged into `main`
- Merge commit: `57e541b`

Note: This handoff file was created after that PR merge. If this file needs to appear on GitHub/main, push or open a follow-up PR intentionally.

## Validation Already Completed

### Syntax Checks

`node --check` passed for:

- `js/app.js`
- `js/core/backup.js`
- `js/core/cloud-state.js`
- `js/core/dom-actions.js`
- `js/core/state-utils.js`
- `js/views/board.js`
- `js/views/notices.js`
- `js/views/progress.js`
- `js/views/roadmap-schedule.js`
- `js/views/tool-cards.js`
- `js/views/workspace-memo.js`

### Local UI Sweep

The following tabs were checked locally:

- Notices
- Learning roadmap
- Progress
- Tool class
- Workspace
- Schedule
- Class board

Result:

- No console errors.
- No major layout breakage.
- The refactor branch matched the main branch visually and by DOM metrics.

### Netlify Persistence Check

Production Netlify API save/restore was verified:

- API: `https://uiuxa-cc.netlify.app/api/dashboard-state`
- Public/student save returned `mode: "public"`.
- Board, progress, and comment data were changed and then read back successfully.
- Original data was restored afterward using administrator write access.

### Production Deployment Check

After merging to `main`, the Netlify production page loaded the new module files, including:

- `./js/core/state-utils.js`
- `./js/core/backup.js`
- `./js/views/progress.js`
- `./js/views/board.js`
- `./js/views/workspace-memo.js`

Browser console errors were not observed during the deployment check.

## Important Safety Notes

### `react-app/`

The `react-app/` directory is intentionally kept for later use.

Do not:

- delete it
- stage it
- commit it
- use it as the production app without a separate explicit plan

### GitHub Pages

Do not use GitHub Pages as the persistence test target.

Use GitHub Pages only for static-file visibility checks. Server-side save behavior must be tested on Netlify.

### Secrets

Do not write real secrets into documentation, commits, logs, screenshots, PR bodies, or comments.

If administrator write access is needed, ask the user to provide or confirm it through a private channel. Do not retrieve, print, guess, or expose secret values.

### Known Security Debt

There is legacy administrator-password logic in the app and Netlify function. Treat it as security debt and do not copy the actual value into docs, PR bodies, comments, or chat messages.

Recommended future fix:

- move administrator validation fully server-side
- require `DASHBOARD_WRITE_PASSWORD` in Netlify instead of falling back to a hardcoded value
- avoid client-side password comparison for administrator mode
- keep the public/student save path separate from administrator-only full saves

## Recommended Workflow for Future AI Sessions

1. Check the current branch and worktree.

```powershell
git status --short --branch
```

2. If `react-app/` appears as untracked, leave it alone unless the user explicitly asks for React work.

3. Before large changes, create a new branch.

```powershell
git switch main
git pull
git switch -c codex/<task-name>
```

4. Keep changes scoped to the requested behavior.

5. Run syntax checks after JavaScript edits.

```powershell
node --check js/app.js
```

Also run `node --check` on every edited JS module.

6. For UI changes, check the main tabs locally.

7. For persistence changes, verify on Netlify and confirm refresh persistence.

8. Commit only the intended files. Do not use broad staging when `react-app/` is untracked.

```powershell
git add <intended-files-only>
git commit -m "<short summary>"
git push -u origin <branch-name>
```

9. Open a PR to `main`, then validate the deployed Netlify site after merge.

## User-Facing Explanation Points

Use these points when explaining the project to the user:

- Netlify is the correct place to test save behavior.
- GitHub Pages is static and does not provide the server API needed for saving.
- React is not the production replacement yet.
- The current production app is the existing JavaScript app, now split into smaller modules.
- Students can edit the learning board and progress data through the public save path.
