# Arches-Dashboard

## Project Summary

Arches-Dashboard is the operator console for Arches validation.

The `webui` Next.js application provides workspace routes for the dashboard, runs, live run details, logs, modules, reporting, AI/LLM controls, and host/device OTA settings. Its shell provides navigation, connection state, start/stop controls, mode switching, shortcut help, and cached module metadata.

API helpers call module, run, result, log, retention, cancellation, and OTA endpoints. The module catalog merges server data with HAL-derived metadata and retains information for offline display.

Live execution is explicit: `useLiveRunStream.ts` opens the event stream and `reducer.ts` handles run starts, module transitions, results, pauses, and terminal events. Result IDs prevent reconnect replay duplication.

Shared API types, SSE helpers, UI primitives, and the module workspace align routes with the server contract. Python contract tests use `httpx` and pytest; Vitest covers the live-run reducer and formatting utilities.

Browser and manual operator verification are not claimed.

The frontend depends on the server API shape, browser EventSource behavior, and deployment-time URL configuration.

Review authentication, reconnect timing, route accessibility, responsive layouts, and OTA upload handling against a running server before release. Also check empty, loading, error, reconnect, and long-result states in each major workspace route.

No manual verification is implied by frontend source or unit tests.

## Features

| # | Name / Description | Implemented? | Test Coverage? | Manual Test |
|---:|---|---|---|---|
| 1 | Next.js operator console shell | Implemented | Build/lint commands | [ ] Manual verification required |
| 2 | Dashboard, runs, logs, modules, reporting routes | Implemented | Partial: contract tests | [ ] Manual verification required |
| 3 | Live run SSE hook and reducer | Implemented | `webui/lib/live-run/reducer.test.ts` | [ ] Manual verification required |
| 4 | Replay deduplication and terminal handling | Implemented | Reducer tests | [ ] Manual verification required |
| 5 | Module catalog and offline cache | Implemented | Unknown | [ ] Manual verification required |
| 6 | Run, result, log, cancel, OTA API clients | Implemented | Partial: contract tests | [ ] Manual verification required |
| 7 | Settings and retention controls | Implemented | `test_03_settings.py` | [ ] Manual verification required |
| 8 | Shared UI and workspace navigation | Implemented | Unknown | [ ] Manual verification required |
| 9 | REST/SSE contract suite | Implemented | `test_01_smoke.py` through `test_04_streaming.py` | [ ] Manual verification required |
| 10 | Browser usability and visual verification | Unknown | Not evidenced | [ ] Manual verification required |

## Validation Commands

`cd webui && npm test`; `cd webui && npm run build`; `cd contract-tests && pytest`.

## Existing Documentation

TODO: add a description for Arches-Dashboard.

## Documentation

- [webui/README.md](webui/README.md) — Web UI package (Next.js operator console).
- [docs/req.md](docs/req.md) — original design/build prompt for the Web UI.
- [docs/WEB_FINDINGS.md](docs/WEB_FINDINGS.md) — verified Server REST/SSE API inventory.
- [docs/AUDIT.md](docs/AUDIT.md) — independent verification audit of this repo.
- [.claude/skills/dashboard-architecture/SKILL.md](.claude/skills/dashboard-architecture/SKILL.md) — architecture, frontend/backend communication, and UI conventions for coding agents.
