# CLAUDE.md - Arches-Dashboard

Remote: git@github.com:SiliconCentric/Arches-Dashboard.git
Parent project: Arches (target hardware: NVIDIA Jetson (Tegra family, L4T/JetPack OS) application processor with an STM32 real-time co-processor.)
Leaf type: <Project>-Dashboard
Status: REAL - actively built out (corrected 2026-07-29; this file described the repo as a stub with no source files, which was wrong — and it is the file the Loop Engine reads for context)
Stack: node (see loop/fleet-deps.yaml and tools/validate/stack.txt)

A standalone dashboard UI leaf: a Next.js app-router frontend under webui/, a
separate pytest contract-test suite under contract-tests/, and docker packaging
under docker/.

Distinct from Arches-Configuration's on-device dashboard. Both exist and
they are different things: Configuration's UI ships onto the Jetson inside the OS
image; this one is a standalone app. Don't conflate them.

Not proto-coupled to Arches-HAL. It reads from Arches-Server over HTTP/SSE,
which is why contract-tests/ exists — and why a Server-side change can break
this repo without touching a line of its code.

# Commands

- Install deps: make install
- Dev server: make dev
- Build: make build
- Test: make test
- Lint: make lint
- Gate: ./.claude/validate.sh [quick|full]

# Notes

- make lint / build / test all need node_modules. Without them the repo's
  gate reports GATE-BLOCKED (exit 77) rather than a false FAIL — run
  make install first. loop/tools/preflight.sh in the master repo checks for
  this before a loop is allowed to run.
- Two package manifests (package.json and webui/package.json). The gate
  requires a lockfile beside each one; a drifted lockfile is how a build that
  works here fails in CI against a different dependency tree.
- contract-tests/ is Python, not JS, and has its own Makefile. Tests there made
  conditional on a reachable Server are the pattern the Loop Engine's auditor
  looks at hardest — if you make one conditional, say why in the commit message.

Part of the Arches project in the project-managers fleet. See docs/project-managers.md for the full 9-project / 8-leaf hierarchy and shared conventions.

<!-- BEGIN loop-engine -->
## Do's and Don'ts (maintained by the Loop Engine)

Appended by the Loop Engine on loop close; curated by a human when approving a
loop out of in-review/. Nothing outside this fence is engine-writable.

<!-- END loop-engine -->
