// Server-only. Reads/writes the module + test enablement YAML file that
// lives in the host-mounted config dir (see ../../../data/config and
// docker/Makefile). This file is the source of truth for what's enabled —
// the web UI and a hand-edited YAML file both write/read through here.
import { promises as fs } from "node:fs";
import path from "node:path";
import YAML from "yaml";

export interface TestPlanModuleConfig {
  enabled?: boolean;
  tests?: Record<string, boolean>;
}

export interface TestPlanConfig {
  modules?: Record<string, TestPlanModuleConfig>;
}

const FILE_HEADER = `# Module & HAL test enablement for the Acadia Dashboard.
#
# Everything defaults to disabled — a module/test only runs once it is
# listed here with \`enabled: true\`. Edit this file directly and press
# "Reload" in the web UI (or reload the page) to pick up changes, or just
# toggle switches in the UI, which writes back to this same file.
#
# modules:
#   <module_id>:
#     enabled: true
#     tests:
#       <test_id>: true
`;

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
    if (parsed && typeof parsed === "object") return parsed as TestPlanConfig;
    return { modules: {} };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { modules: {} };
    throw err;
  }
}

export async function writeTestPlanConfig(data: TestPlanConfig): Promise<void> {
  await fs.mkdir(configDir(), { recursive: true });
  await fs.writeFile(configFilePath(), FILE_HEADER + YAML.stringify(data), "utf8");
}

export async function setModuleEnabled(moduleId: string, enabled: boolean): Promise<TestPlanConfig> {
  const data = await readTestPlanConfig();
  data.modules ??= {};
  data.modules[moduleId] = { ...data.modules[moduleId], enabled };
  await writeTestPlanConfig(data);
  return data;
}

export async function setTestEnabled(moduleId: string, testId: string, enabled: boolean): Promise<TestPlanConfig> {
  const data = await readTestPlanConfig();
  data.modules ??= {};
  const mod = data.modules[moduleId] ?? {};
  mod.tests = { ...mod.tests, [testId]: enabled };
  data.modules[moduleId] = mod;
  await writeTestPlanConfig(data);
  return data;
}
