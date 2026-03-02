# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js CLI tool that syncs time entries from Timeular (a physical time-tracking device/service) to Noko (a business time-tracking platform). It retrieves time entries from Timeular, groups them by project, and creates corresponding entries in Noko.

## Development Commands

### Running the Application
```bash
node index.js                    # Interactive prompt to select report
node index.js -r <report>        # Run specific report
node index.js -r customDate      # Prompt for specific date
node index.js -m <minutes>       # Set rounding increment (default: 5)
node index.js -d                 # Enable debug mode
```

Available report types: `today`, `yesterday`, `thisWeek`, `lastWeek`, `customDate`, `activities`

### Testing
```bash
npm test                         # Run all tests with Mocha
```

## Configuration

The application requires a `config.js` file (not tracked in git) based on `example.config.js`. Key configuration:

- `timeularKey` / `timeularSecret`: Timeular API credentials
- `nokoToken`: Noko Personal Access Token
- `activityProjectMap`: Maps Timeular Activity IDs to Noko Project IDs
- `roundProject`: Round project summary time to nearest minute increment (default: 15)
- `roundEntry`: Round each time entry (set via CLI, default: 5)
- `prefixNotes`: Whether to prefix activity notes with activity name (default: false)

## Architecture

### Core Components

**Main Entry Point** (`index.js`)
- Uses Commander for CLI argument parsing
- Uses Inquirer for interactive prompts
- Orchestrates the flow: init → load report → print → optionally submit to Noko

**Timeular2Noko Class** (`src/Timeular2Noko.js`)
- Main business logic coordinator
- Manages both TimeularApi and NokoApi instances
- Handles grouping entries by date/project
- Calculates billable vs non-billable summaries
- Formats and prints reports to console
- Submits entries to Noko

**API Clients**
- `lib/TimeularApi.js`: Handles Timeular API v3 requests with caching (NodeCache)
- `lib/NokoApi.js`: Handles Noko API v2 requests with caching

**Data Models** (`lib/src/`)
- `TimeularEntry.js`: Represents a Timeular time entry
- `TimeularActivity.js`: Represents a Timeular activity
- `NokoTimeEntry.js`: Represents a Noko time entry payload
- `NokoProject.js`: Represents a Noko project

**Reports** (`src/reports.js`)
- Configuration object defining available reports
- Each report has: `label`, `load()`, `print()`, optional `sendToNoko` flag
- Reports use the pattern: load data → print to console → optionally submit

### Date Handling

The application extends `Date.prototype` (`lib/Date.prototype.js`) with custom methods:
- `getTimeularTime()`: Formats dates for Timeular API (ISO string without Z, timezone-adjusted)
- Additional date manipulation methods defined in `src/prototype.js` (e.g., `setDayStart()`, `setWeekStart()`)

These prototype extensions are required before other modules are loaded.

### Data Flow

1. **Authentication**: Connect to Timeular API (JWT token), Noko uses header token
2. **Data Retrieval**: Fetch Timeular entries for date range, fetch Timeular activities
3. **Activity Mapping**: Match Timeular activity IDs to Noko project IDs via config
4. **Grouping**: Group entries by date, then by Noko project
5. **Enrichment**: Fetch Noko project details for each group
6. **Display**: Calculate totals, format output with colors library
7. **Submission** (optional): Create Noko entries via API, skip inactive/archived projects

### Key Patterns

- **Caching**: Both API clients use NodeCache to reduce redundant requests
- **Promise-based**: All async operations use Promises/async-await
- **Note Processing**: Extracts tags (starting with #) and notes from Timeular entries, optionally prefixes non-tag notes with activity names
- **Time Rounding**: Entries rounded using `Math.ceilX()` (custom method) based on config
- **Error Handling**: API errors caught and displayed with optional debug details

## Important Notes

- Timeular API requires authentication via API key/secret to obtain a session token
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
