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
- Handoff documentation commit on `main`: `198a825 Add AI handoff documentation`

Note: The base handoff file was added to `main` in `198a825`. Later edits should be reviewed, committed, and pushed intentionally.

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

## Upcoming Classroom Page Layout Workflow

The user plans to redesign the classroom/class page layout. Do not start coding from the design message alone.

Required process:

1. The user sends the desired classroom page design or layout direction.

2. Before editing code, write a detailed implementation plan and send it to the user.

3. The plan must cover:

- user-facing interpretation of the requested layout
- which classroom page areas will change
- which areas should remain unchanged
- current HTML/CSS/JS structure related to the page
- likely files to edit
- how the layout will be implemented
- desktop and mobile responsive behavior
- risk areas such as text overflow, button wrapping, card sizing, and overlapping UI
- possible impact on existing actions, saves, tabs, and other dashboard views
- validation steps
- how the experiment branch will be compared with `main`
- rollback or stop criteria if the change becomes risky

4. Do not edit code until the user clearly says to execute the plan, for example: "execute the plan" or "plan execution".

5. When approved, experiment on the `js-refactor-light` branch first, not directly on `main`. Before editing, make sure the experiment branch includes the latest `main` changes or intentionally document why it does not.

6. Implement the change in the same maintainable style used so far:

- prefer the existing `js/views/*` and `js/core/*` structure
- keep large behavior out of `js/app.js` when a view module is the better home
- separate layout rendering from state/data helper logic where practical
- avoid unnecessary duplication
- keep changes scoped to the classroom page unless shared behavior truly needs to change
- do not introduce React for this task unless the user explicitly changes direction
- do not touch `react-app/`

7. After implementation, verify:

- `node --check` for every edited JavaScript file
- local classroom page rendering
- desktop layout
- mobile layout
- no obvious text overlap or broken controls
- no browser console errors
- existing classroom page behavior still works
- unrelated tabs still load at least as a smoke test

8. Compare the experiment against the current `main` branch:

- confirm differences are intentional on the classroom page
- confirm unrelated pages do not visually regress
- check for unexpected layout shifts, missing text, broken controls, or changed persistence behavior

9. Report results to the user before any `main` merge:

- files changed
- implementation approach
- validation performed
- differences versus `main`
- problems found or remaining risks
- whether the change looks ready to merge

10. Only move the change to `main` after the user approves the experiment result.

## User-Facing Explanation Points

Use these points when explaining the project to the user:

- Netlify is the correct place to test save behavior.
- GitHub Pages is static and does not provide the server API needed for saving.
- React is not the production replacement yet.
- The current production app is the existing JavaScript app, now split into smaller modules.
- Students can edit the learning board and progress data through the public save path.
