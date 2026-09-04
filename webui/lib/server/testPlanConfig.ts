// Server-only. Reads/writes the module + test enablement YAML file that
// lives in the host-mounted config dir (see ../../../data/config and
// docker/Makefile). This file is the source of truth for what's enabled —
// the web UI and a hand-edited YAML file both write/read through here.
import { promises as fs } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { HAL_MODULE_CATALOG } from "@/lib/modules/hal-derived-catalog";

export interface TestPlanModuleConfig {
  enabled?: boolean;
  tests?: Record<string, boolean>;
}

export interface TestPlanConfig {
  modules?: Record<string, TestPlanModuleConfig>;
}

const FILE_HEADER = `# Module & HAL test enablement for the Acadia Dashboard.
#
# Every known module and test is listed explicitly below — disabled ones
# read \`enabled: false\` / \`false\` rather than being left out, so the full
# picture is visible at a glance. Edit values directly and press "Reload"
# in the web UI (or reload the page) to pick up changes, or just toggle
# switches in the UI, which write back to this same file.
#
# modules:
#   <module_id>:
#     enabled: true
#     tests:
#       <test_id>: true
`;

// The complete catalog, all off — the baseline every read/write is merged
// against so the file always lists every module and test explicitly.
function fullDefaultConfig(): Required<TestPlanConfig> {
  const modules: Record<string, Required<TestPlanModuleConfig>> = {};
  for (const mod of HAL_MODULE_CATALOG) {
    const tests: Record<string, boolean> = {};
    for (const test of mod.tests) tests[test.id] = false;
    modules[mod.id] = { enabled: false, tests };
  }
  return { modules };
}

// Overlays saved enabled/disabled values onto the full catalog, so every
// module and test is always present — never just omitted when off.
function mergeWithCatalog(overrides: TestPlanConfig): TestPlanConfig {
  const full = fullDefaultConfig();
  for (const [moduleId, override] of Object.entries(overrides.modules ?? {})) {
    const base = full.modules[moduleId] ?? { enabled: false, tests: {} };
    full.modules[moduleId] = {
      enabled: override.enabled ?? base.enabled,
      tests: { ...base.tests, ...override.tests },
    };
  }
  return full;
}

function configDir(): string {
  // In the Docker image CONFIG_DIR=/app/data/config (see docker/Dockerfile).
  // In local dev, cwd is webui/, so data/ lives one directory up.
  return process.env.CONFIG_DIR ?? path.join(process.cwd(), "..", "data", "config");
}

function configFilePath(): string {
  return path.join(configDir(), "test-plan.yaml");
}

export async function readTestPlanConfig(): Promise<TestPlanConfig> {
  try {
    const raw = await fs.readFile(configFilePath(), "utf8");
    const parsed: unknown = YAML.parse(raw);
    const data = parsed && typeof parsed === "object" ? (parsed as TestPlanConfig) : {};
    return mergeWithCatalog(data);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return mergeWithCatalog({});
    throw err;
  }
}

export async function writeTestPlanConfig(data: TestPlanConfig): Promise<void> {
  await fs.mkdir(configDir(), { recursive: true });
  const full = mergeWithCatalog(data);
  await fs.writeFile(configFilePath(), FILE_HEADER + YAML.stringify(full), "utf8");
}

// Every toggle in the UI is a read-modify-write against the same file, so
// two switches flipped in quick succession could otherwise race: both read
// the old contents, and the second write silently discards the first. This
// queue serializes them so each PATCH is saved immediately and in order.
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueueMutation<T>(mutate: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(mutate, mutate);
  // Swallow rejections here so one failed mutation doesn't wedge the queue
  // for subsequent, unrelated toggles; the caller still sees the real error.
  writeQueue = result.catch(() => undefined);
  return result;
}

export async function setModuleEnabled(moduleId: string, enabled: boolean): Promise<TestPlanConfig> {
  return enqueueMutation(async () => {
    const data = await readTestPlanConfig();
    data.modules ??= {};
    data.modules[moduleId] = { ...data.modules[moduleId], enabled };
    await writeTestPlanConfig(data);
    return data;
  });
}

export async function setTestEnabled(moduleId: string, testId: string, enabled: boolean): Promise<TestPlanConfig> {
  return enqueueMutation(async () => {
    const data = await readTestPlanConfig();
    data.modules ??= {};
    const mod = data.modules[moduleId] ?? {};
    mod.tests = { ...mod.tests, [testId]: enabled };
    data.modules[moduleId] = mod;
    await writeTestPlanConfig(data);
    return data;
  });
}
