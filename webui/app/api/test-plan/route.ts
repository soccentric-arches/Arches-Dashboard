import { NextResponse } from "next/server";
import { readTestPlanConfig, setModuleEnabled, setTestEnabled } from "@/lib/server/testPlanConfig";

// Never cache — every GET re-reads the YAML file from disk, which is what
// makes a hand edit + "Reload" in the UI (or a page refresh) actually work.
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readTestPlanConfig();
  return NextResponse.json(data);
}

interface PatchBody {
  moduleId: string;
  enabled?: boolean;
  testId?: string;
  testEnabled?: boolean;
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as PatchBody;
  if (!body.moduleId) {
    return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
  }

  let data;
  if (body.testId && typeof body.testEnabled === "boolean") {
    data = await setTestEnabled(body.moduleId, body.testId, body.testEnabled);
  } else if (typeof body.enabled === "boolean") {
    data = await setModuleEnabled(body.moduleId, body.enabled);
  } else {
    return NextResponse.json({ error: "enabled or (testId and testEnabled) is required" }, { status: 400 });
  }

  return NextResponse.json(data);
}
