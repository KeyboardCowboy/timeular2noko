# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive Node.js CLI that pulls time entries from **Early** (formerly Timeular, a time tracker driven by a physical octahedron) and logs them to **Noko**, the company's official time-tracking system. Entries are grouped per day per Noko project, summarized as billable/non-billable, printed, and submitted to Noko after confirmation.

GitHub: `KeyboardCowboy/timeular2noko`. Open issues track the remaining work (Early rebrand #18/#19, replacing the deprecated `request` package #17, graceful API failure #15, interactive mapping task #14, custom date range #16).

### Branch state

- `main` / `1.x-main`: the original CommonJS app (`commander` flags plus an `inquirer` report menu driven by `src/reports.js`).
- `2.x-main`: ES modules, menu rebuilt on `@keyboardcowboy/taskprompt`, legacy `reports.js` / `report.js` / `utils.js` removed.
- `feature/18-early-rebrand`: 2.x plus the Timeular → Early rename (#18). This is the newest line of work and the branch this file describes. The Early API host and version are still v3 (#19).
- The project is planned to move to TypeScript, but no TS tooling exists yet. `@keyboardcowboy/taskprompt` (the author's own package) is already TS and ships `.d.ts` types. The tasks reference those types through JSDoc `@typedef import(...)`.

## Commands

```bash
npm install
node index.js        # boots, authenticates with Early, shows the task menu
node index.js -d     # debug: log API requests and cache hits
npm test             # offline unit tests in test/ (TZ pinned to UTC)
npm test -- test/Early2Noko.test.js                  # single file
npm test -- test/Early2Noko.test.js -g "Note Filter" # single describe/it by name
npm run test:live    # test/live/: hits the real APIs using config.js
```

There is no build step, linter, or formatter configured on this branch. `.husky/` holds only generated stubs, with no active hooks.

`npm test` runs mocha's default spec (the top level of `test/` only), with `test/sample-config.js` as a fake config. Always run the tests through the npm script rather than plain `npx mocha`: the date helpers shift hours by the local timezone offset, and the `DatePrototype` assertions only hold in UTC. The tests in `test/live/` call the real Early and Noko APIs and are unreliable (#23 tracks a proper offline suite). Don't run them unless asked: the Noko one is written to create a real time entry. `tests/` (plural) is an empty scaffold left over from the abandoned `feature/model-migration` branch.

## Configuration

`config.js` (gitignored, ES module `export default {...}`) is needed to run anything. In this checkout it is a symlink to `../../env/config-timetracker.js`. Never commit it or print its contents. See `example.config.js` for the keys:

- `earlyKey` / `earlySecret`: exchanged for a bearer token at `developer/sign-in`.
- `nokoToken`: sent as the `X-NokoToken` header.
- `activityProjectMap`: `{ earlyActivityId: nokoProjectId }`. Unmapped activities fall into project `0`.
- `roundProject` (minutes): rounds each project's daily total.
- `prefixNotes`: prefixes non-tag notes with the activity name.
- `roundEntry` is set in `initApp()` (`options.roundUp || 5`) and nothing reads it at the moment (#21). The `-m` flag from 1.x was never restored for that reason.

## Architecture

```
index.js ──side-effect imports──> src/prototype.js, lib/Date.prototype.js
   │
   ├─ await initApp()            src/AppContext.js  (module-level singleton)
   │      └─ new Early2Noko(config).init()  → EarlyApi.connect() (token)
   │
   └─ TaskManager.registerTasks(tasks).run()   @keyboardcowboy/taskprompt
          └─ src/tasks/*.js  → getT2N() → Early2Noko → lib/EarlyApi, lib/NokoApi
```

- **Tasks** (`src/tasks/`): plain objects `{ id, name, weight, chain, questions?, execute(taskManager, answers) }`, registered in `src/tasks/index.js`. `weight` sets the menu order (lower comes first). `chain: true` returns to the menu after the task runs. `questions` are inquirer prompts whose answers reach `execute`. Each report task builds a date range with the prototype helpers, fetches entries, prints a summary, then asks "Submit to Noko?" with inquirer. Today, Yesterday, This Week, Last Week, and Choose Date are near-duplicates of each other.
- **`src/Early2Noko.js`**: all business logic. It groups entries by day (`groupEarlyEntriesByDate`) and by Noko project (`groupEarlyEntriesByProject`, which also fetches the `NokoProject` objects), builds note/tag descriptions (`getTasksFromEarlyEntries` → `filterNotes`), rounds and sums durations, prints console reports (using the `colors` String-prototype API, e.g. `'x'.bold.red`), and posts `NokoTimeEntry`s. It skips projects that are invalid (id 0 / 404) or disabled.
- **API clients** (`lib/EarlyApi.js`, `lib/NokoApi.js`): wrap the deprecated `request` package in Promises. Every successful GET is cached in an in-memory `NodeCache` keyed by endpoint. Early's base URL is still `api.timeular.com/api/v3/`. `EarlyApi.getTimeEntries` attaches the matching `EarlyActivity` to each `EarlyEntry` and sorts them. Noko has no batch project endpoint, so `getProjects` fans out to one `getProject` call per id. A 404 becomes a placeholder "No Project" `NokoProject`.
- **Models** (`lib/src/`): thin wrappers around raw API JSON (`EarlyEntry.earlyObject`, `EarlyActivity.activity`, `NokoProject`). `NokoTimeEntry.getPayloadData()` builds the POST body for Noko. Early returns timestamps without a zone, so `EarlyEntry` appends `'z'` before parsing.

### Global prototype extensions (load-order critical)

Date and time logic lives on built-ins, not in imported functions. `index.js` must import both files before anything else, and tests must do the same.

- `src/prototype.js`: `Date#setDayStart/setDayEnd/setWeekStart/setWeekEnd(offset)`, `getDayFull`, `getDowFull`, `getMonthAbbrev`, `Math.ceilX(x, step)` (round up to a step), `Array#timeSort`.
- `lib/Date.prototype.js`: `Date#getEarlyTime()`, `Array#earlyEntryTimeSort`.

Timezone handling is hand-rolled. The `set*Start/End` helpers shift hours by `getTimezoneOffset()`, and `getEarlyTime()` **mutates the Date it is called on** before formatting it as a zoneless ISO string. Treat changes here carefully, since past bugs came from this code (Sunday lookup, week boundaries).

## Known Issues

Open GitHub issues #15–#28 cover the known bugs and planned work. The ones most likely to bite:

- `EarlyApi` still targets the v3 host `api.timeular.com/api/v3/`. v4 (`api.early.app/api/v4/`, #19) replaces `entry.activityId` with an embedded `entry.activity`, so matching activities has to change when switching.
- If `connect()` fails, `Early2Noko.init()` logs the error and never resolves or rejects, so the app hangs. The API helpers also call `process.exit(1)` on errors (#15).
- A mapped Noko project that returns 404 crashes `groupEarlyEntriesByProject()` (#20).
- Nothing stops the same day from being submitted to Noko twice (#22).

## Working Notes

- `memory-bank/` and `.cursor/rules/` are Cursor artifacts (untracked). `activeContext.md` and `progress.md` accurately describe the 2.x ES-module and TaskPrompt work. `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, and `projectStructure.md` are generic, hallucinated content: they mention Express, Jest, file storage, and axios, none of which this project uses. Don't rely on those files.
- From the Cursor developer-role rule: the author's background is PHP/Drupal and Node, and they are still building up JavaScript and TypeScript skills. Explain the reasoning behind non-obvious JS/TS decisions and trade-offs.
