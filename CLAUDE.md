# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js CLI tool that syncs time entries from Early (a physical time-tracking device/service) to Noko (a business time-tracking platform). It retrieves time entries from Early, groups them by project, and creates corresponding entries in Noko.

## Development Commands

### Running the Application
```bash
node index.js                    # Interactive prompt to select task
node index.js -m <minutes>       # Set rounding increment (default: 5)
node index.js -d                 # Enable debug mode
```

Available tasks: `Today's Hours`, `Yesterday's Hours`, `This Week's Hours`, `Last Week's Hours`, `Choose Date`, `Early Activities`

### Testing
```bash
npm test                         # Run all tests with Mocha
```

## Configuration

The application requires a `config.js` file (not tracked in git) based on `example.config.js`. Key configuration:

- `earlyKey` / `earlySecret`: Early API credentials
- `nokoToken`: Noko Personal Access Token
- `activityProjectMap`: Maps Early Activity IDs to Noko Project IDs
- `roundProject`: Round project summary time to nearest minute increment (default: 15)
- `roundEntry`: Round each time entry (set via CLI, default: 5)
- `prefixNotes`: Whether to prefix activity notes with activity name (default: false)

## Architecture

### Core Components

**Main Entry Point** (`index.js`)
- Imports prototype side-effect files
- Calls `initApp()` to authenticate with Early before the menu starts
- Uses TaskManager from `@keyboardcowboy/taskprompt` for interactive task selection

**AppContext** (`src/AppContext.js`)
- Singleton that initializes and exposes the `Early2Noko` instance
- Tasks call `getT2N()` to access the initialized APIs

**Early2Noko Class** (`src/Early2Noko.js`)
- Main business logic coordinator
- Manages both EarlyApi and NokoApi instances
- Handles grouping entries by date/project
- Calculates billable vs non-billable summaries
- Formats and prints reports to console
- Submits entries to Noko

**API Clients**
- `lib/EarlyApi.js`: Handles Early API v3 requests with caching (NodeCache)
- `lib/NokoApi.js`: Handles Noko API v2 requests with caching

**Data Models** (`lib/src/`)
- `EarlyEntry.js`: Represents an Early time entry
- `EarlyActivity.js`: Represents an Early activity
- `NokoTimeEntry.js`: Represents a Noko time entry payload
- `NokoProject.js`: Represents a Noko project

**Tasks** (`src/tasks/`)
- Each task implements `execute()` with report logic and optional Noko submission prompt
- Tasks import `getT2N()` from `AppContext.js`

### Date Handling

The application extends `Date.prototype` (`lib/Date.prototype.js`) with custom methods:
- `getEarlyTime()`: Formats dates for Early API (ISO string without Z, timezone-adjusted)
- Additional date manipulation methods defined in `src/prototype.js` (e.g., `setDayStart()`, `setWeekStart()`)

These prototype extensions are required before other modules are loaded.

### Data Flow

1. **Authentication**: Connect to Early API (JWT token), Noko uses header token
2. **Data Retrieval**: Fetch Early entries for date range, fetch Early activities
3. **Activity Mapping**: Match Early activity IDs to Noko project IDs via config
4. **Grouping**: Group entries by date, then by Noko project
5. **Enrichment**: Fetch Noko project details for each group
6. **Display**: Calculate totals, format output with colors library
7. **Submission** (optional): Create Noko entries via API, skip inactive/archived projects

### Key Patterns

- **Caching**: Both API clients use NodeCache to reduce redundant requests
- **Promise-based**: All async operations use Promises/async-await
- **Note Processing**: Extracts tags (starting with #) and notes from Early entries, optionally prefixes non-tag notes with activity names
- **Time Rounding**: Entries rounded using `Math.ceilX()` (custom method) based on config
- **Error Handling**: API errors caught and displayed with optional debug details

## Important Notes

- Early API requires authentication via API key/secret to obtain a session token
- Noko API uses personal access tokens in the `X-NokoToken` header
- The config file (`config.js`) is gitignored and must be created locally
- Active Noko projects only: Time will not be logged to archived/deactivated projects
- Billable status is determined by the Noko project's `billable` property
- Date arithmetic relies on prototype extensions that handle timezone offsets

## Cursor Rules

This project uses Cursor's Memory Bank system (see `.cursor/rules/memory-bank.mdc`) and operates in two modes:
- **Plan Mode**: Gather information, define plans, no code changes
- **Act Mode**: Execute changes based on approved plan
- Always start in Plan Mode until user types `ACT` to approve
