// Client for the dashboard's own /api/test-plan route (same origin) — not
// the external Arches-Server API, so this intentionally bypasses
// lib/api/client.ts's apiUrl()/API_BASE.
export interface TestPlanModuleConfig {
  enabled?: boolean;
  tests?: Record<string, boolean>;
}

export interface TestPlanConfig {
  modules?: Record<string, TestPlanModuleConfig>;
}

async function fetchTestPlanJson(init?: RequestInit): Promise<TestPlanConfig> {
  const response = await fetch("/api/test-plan", {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`test-plan API ${response.status}: ${body || response.statusText}`);
  }
  return (await response.json()) as TestPlanConfig;
}

export function getTestPlanConfig(): Promise<TestPlanConfig> {
  return fetchTestPlanJson();
}

export function setModuleEnabled(moduleId: string, enabled: boolean): Promise<TestPlanConfig> {
  return fetchTestPlanJson({ method: "PATCH", body: JSON.stringify({ moduleId, enabled }) });
}

export function setTestEnabled(moduleId: string, testId: string, testEnabled: boolean): Promise<TestPlanConfig> {
  return fetchTestPlanJson({ method: "PATCH", body: JSON.stringify({ moduleId, testId, testEnabled }) });
}
