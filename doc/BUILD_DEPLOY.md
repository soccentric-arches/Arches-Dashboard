# Arches-Dashboard Build and Deployment

## 1. Purpose and scope

Arches-Dashboard is a Next.js web UI under `webui/`, with a Docker image workflow and a separate Python contract-test suite under `contract-tests/`. The root Makefile is the supported entry point.

## 2. Prerequisites

Install Node.js/npm for the web UI. Docker is required for image workflows. Contract tests require Python, `uv` or the Makefile's virtualenv flow, and a running Arches Server endpoint. The web package scripts include Next.js, Vitest, ESLint, and TypeScript tooling.

## 3. Setup

Run `make install` to execute `npm install` in `webui`. For contract tests, run `make -C contract-tests setup`; this creates `.venv` and installs pytest, timeout/coverage plugins, Ruff, HTTPX, and SSE support.

## 4. Build and compile

- `make dev` starts the web UI development server with `npm run dev`.
- `make build` runs `npm run build` in `webui` and creates the Next production output under `webui/.next`.
- `make docker-build` delegates to `docker/Makefile`; override `IMAGE` and `TAG` as needed.

## 5. Test and lint

- `make test` runs `npm test`/Vitest in `webui`.
- `make lint` runs the web ESLint command.
- `make -C contract-tests test` runs all browser-free contract tests against `ACADIA_SERVER_URL` (default `http://localhost:8080`).
- `make -C contract-tests test-smoke` runs only the smoke-marked contract tests.
- `make -C contract-tests lint` runs Ruff over the contract tests.

Contract tests require a compatible running server and are not a substitute for a UI browser check.

## 6. Packaging and artifacts

The web production bundle is `webui/.next`. `make docker-build IMAGE=<name> TAG=<tag>` produces `<name>:<tag>` using `docker/Dockerfile`. Docker target defaults are defined by `docker/Makefile`; inspect them before publishing.

## 7. Deployment, install, and run

- `make docker-run` starts the image detached, using the Docker Makefile's default port `3010` unless `PORT` is overridden.
- `make docker-logs` tails container logs.
- `make docker-shell` opens a shell in the running container.
- `make docker-stop` stops/removes the container.

Registry publishing, credentials, and cloud deployment are not defined by this repository's Makefiles. Supply those steps through the consuming deployment system only after the image has been tested.

## 8. Cleanup

`make clean` removes `.next` artifacts. `make docker-clean` stops the container and removes the configured image. Contract-test `make -C contract-tests clean` removes test caches; `distclean` also removes its virtualenv.

## 9. Hardware, cloud, and manual verification caveats

The dashboard is software-only but depends on server API/SSE behavior. Set `ACADIA_SERVER_URL` explicitly when testing against a device or non-local server, and verify authentication, streaming, and browser navigation manually. Docker availability and any registry credentials are conditional requirements.
