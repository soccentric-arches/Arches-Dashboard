# Arches-Dashboard — specs

Remote: `git@github.com:SiliconCentric/Arches-Dashboard.git`
Parent project: Arches (target hardware: NVIDIA Jetson, Tegra family, L4T/JetPack OS, with an STM32 real-time co-processor)
Leaf type: `<Project>-Dashboard`
Status: REAL — actively built out (corrected 2026-07-29; this file described the repo as a stub with no source files, which was wrong, and it is the file the Loop Engine reads for context)
Stack: node (see `loop/fleet-deps.yaml` and `tools/validate/stack.txt`)

## What this is

A standalone dashboard UI leaf: a Next.js app-router frontend under `webui/`, a separate pytest contract-test suite under `contract-tests/`, and docker packaging under `docker/`.

Distinct from Arches-Configuration's on-device dashboard. Both exist and they are different things: Configuration's UI ships onto the Jetson inside the OS image; this one is a standalone app. Don't conflate them.

Not proto-coupled to Arches-HAL. It reads from Arches-Server over HTTP/SSE, which is why `contract-tests/` exists — and why a Server-side change can break this repo without touching a line of its code.

Part of the Arches project in the project-managers fleet. See `docs/project-managers.md` for the full 9-project / 8-leaf hierarchy and shared conventions.
