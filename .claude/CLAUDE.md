# CLAUDE.md - Arches-Dashboard

See [project_specs.md](project_specs.md) for what this repo is and how it fits the fleet.

## Commands

* Install deps: `make install`
* Dev server: `make dev`
* Build: `make build`
* Test: `make test`
* Lint: `make lint`
* Gate: `./.claude/validate.sh [quick|full]`

## Notes

* `make lint` / `build` / `test` all need `node_modules`. Without them the repo's gate reports GATE-BLOCKED (exit 77) rather than a false FAIL — run `make install` first. `loop/tools/preflight.sh` in the master repo checks for this before a loop is allowed to run.
* Two package manifests (`package.json` and `webui/package.json`). The gate requires a lockfile beside each one; a drifted lockfile is how a build that works here fails in CI against a different dependency tree.
* `contract-tests/` is Python, not JS, and has its own Makefile. Tests there made conditional on a reachable Server are the pattern the Loop Engine's auditor looks at hardest — if you make one conditional, say why in the commit message.

<!-- BEGIN loop-engine -->
## Do's and Don'ts (maintained by the Loop Engine)

Appended by the Loop Engine on loop close; curated by a human when approving a loop out of in-review/. Nothing outside this fence is engine-writable.

<!-- END loop-engine -->
