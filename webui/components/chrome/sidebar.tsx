"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Bot, BarChart2, Battery, Cable, ChevronLeft, ChevronRight, Clock, Cpu, FileText, Gauge, HardDrive, History, LayoutDashboard, Monitor, Network, Settings, ShieldCheck, Zap } from "lucide-react";
import { getModules } from "@/lib/api";
import { modulesForOfflineDisplay, writeCachedModules } from "@/lib/modules/catalog";
import type { ModuleInfo } from "@/lib/types/api";

function groupModules(modules: ModuleInfo[]): Array<{ category: string; modules: ModuleInfo[] }> {
  const map = new Map<string, ModuleInfo[]>();
  modules.forEach((module) => {
    if (!map.has(module.category)) map.set(module.category, []);
    map.get(module.category)?.push(module);
  });

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([category, list]) => ({
      category,
      modules: list.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

// Stable DOM id for a category's child list, referenced by the toggle's
// aria-controls. The index suffix disambiguates categories whose names
// slugify to the same value (e.g. "high_speed" vs "high speed").
function categoryDomId(category: string, index: number): string {
  const slug = category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `sidebar-group-${slug.length > 0 ? slug : "category"}-${index}`;
}

export function Sidebar({
  collapsed,
  setCollapsed,
  locked,
  search,
  setSearch,
  onRegisterSearchFocus,
}: {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  locked: boolean;
  search: string;
  setSearch: (value: string) => void;
  onRegisterSearchFocus: (focusFn: (() => void) | null) => void;
}) {
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Tree expansion state. Starts empty so every category node renders
  // collapsed by default; the operator expands branches on demand.
  // Deliberately not persisted — a fresh page load always starts fully
  // collapsed.
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set<string>());

  const { data: liveModules } = useQuery({
    queryKey: ["modules"],
    queryFn: getModules,
  });

  useEffect(() => {
    if (liveModules && liveModules.length > 0) writeCachedModules(liveModules);
  }, [liveModules]);

  const modules = useMemo(() => modulesForOfflineDisplay(liveModules), [liveModules]);

  const grouped = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const filtered = normalized
      ? modules.filter((module) => {
        return (
          module.name.toLowerCase().includes(normalized) ||
          module.id.toLowerCase().includes(normalized) ||
          module.category.toLowerCase().includes(normalized)
        );
      })
      : modules;
    return groupModules(filtered);
  }, [modules, search]);

  const isSearching = search.trim().length > 0;

  const activeModule = useMemo(
    () => modules.find((module) => pathname === `/modules/${module.id}`) ?? null,
    [modules, pathname],
  );

  const lastRevealedModuleRef = useRef<string | null>(null);

  // Reveal-on-navigate: when the active module changes, expand its
  // category so the active item is visible in an otherwise-collapsed
  // tree. This reacts to external navigation (not derived state). The
  // ref guard means we only fire once per target module, so if the
  // operator manually re-collapses that branch afterwards we don't
  // fight them until they navigate somewhere else.
  useEffect(() => {
    if (!activeModule || lastRevealedModuleRef.current === activeModule.id) return;
    lastRevealedModuleRef.current = activeModule.id;
    // Updater form: deriving the next set from the previous one.
    setExpandedCategories((prev) => (prev.has(activeModule.category) ? prev : new Set(prev).add(activeModule.category)));
  }, [activeModule]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const iconForCategory = (category: string) => {
    const normalized = category.toLowerCase();
    if (normalized.includes("network")) return Network;
    if (normalized.includes("storage")) return HardDrive;
    if (normalized.includes("sensor")) return Gauge;
    if (normalized.includes("serial") || normalized.includes("bus")) return Cable;
    if (normalized.includes("media")) return Activity;
    if (normalized.includes("safety")) return ShieldCheck;
    if (normalized.includes("high_speed") || normalized.includes("high speed")) return Zap;
    if (normalized.includes("system")) return Monitor;
    if (normalized.includes("power")) return Battery;
    if (normalized.includes("io")) return Monitor;
    if (normalized.includes("timing")) return Clock;
    if (normalized.includes("compute")) return Cpu;
    return Cpu;
  };

  useEffect(() => {
    onRegisterSearchFocus(() => searchInputRef.current?.focus());
    return () => onRegisterSearchFocus(null);
  }, [onRegisterSearchFocus]);

  const topLevelLinkClass = cn(
    "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
    locked && "cursor-not-allowed opacity-60",
  );

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "sticky top-[var(--shell-header-height)] h-[calc(100vh-var(--shell-header-height))] border-r border-border bg-background/80 backdrop-blur-md transition-[width]",
        collapsed ? "w-[60px]" : "w-[280px]",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-border p-3">
          <div className="flex items-center justify-between gap-2">
            {!collapsed && (
              <input
                ref={searchInputRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search modules"
                className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            )}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Toggle sidebar"
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2">
          <ul className="space-y-0.5">
            <li>
              <Link
                href={locked ? pathname : "/dashboard"}
                onClick={(event) => {
                  if (locked) event.preventDefault();
                }}
                aria-current={pathname === "/dashboard" ? "page" : undefined}
                className={cn(
                  topLevelLinkClass,
                  pathname === "/dashboard"
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <LayoutDashboard size={16} aria-hidden="true" />
                {!collapsed && "Dashboard"}
              </Link>
            </li>

            {grouped.map((group, groupIndex) => {
              // While searching, every matching branch is force-expanded
              // so results are always visible; the operator's manual
              // expansion state resumes once the search is cleared.
              const isExpanded = isSearching || expandedCategories.has(group.category);
              const listId = categoryDomId(group.category, groupIndex);
              const CategoryIcon = iconForCategory(group.category);
              return (
                <li key={group.category}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(group.category)}
                    aria-expanded={isExpanded}
                    aria-controls={listId}
                    title={group.category}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground",
                      collapsed ? "ml-1.5 h-8 w-8 justify-center" : "px-2 py-1.5 text-left",
                    )}
                  >
                    <ChevronRight
                      size={14}
                      aria-hidden="true"
                      className={cn("shrink-0 transition-transform duration-150", isExpanded && "rotate-90")}
                    />
                    {!collapsed && (
                      <>
                        <CategoryIcon size={14} aria-hidden="true" className="shrink-0" />
                        <span className="truncate">{group.category}</span>
                        <span className="ml-auto text-[10px] font-normal normal-case tracking-normal text-muted-foreground/60">
                          {group.modules.length}
                        </span>
                      </>
                    )}
                  </button>

                  {isExpanded && (
                    <ul
                      id={listId}
                      className={cn(
                        "animate-expand-down",
                        !collapsed && "ml-[15px] border-l border-border",
                      )}
                    >
                      {group.modules.map((module) => {
                        const href = `/modules/${module.id}`;
                        const active = pathname === href;
                        const ModuleIcon = iconForCategory(module.category);
                        return (
                          <li key={module.id} className={cn(!collapsed && "relative")}>
                            <Link
                              href={locked ? pathname : href}
                              onClick={(event) => {
                                if (locked) event.preventDefault();
                              }}
                              title={module.name || module.id}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "flex items-center gap-2 rounded-md text-sm transition-colors",
                                !collapsed &&
                                "relative py-1.5 pl-4 pr-2 before:absolute before:left-0 before:top-1/2 before:h-px before:w-2.5 before:-translate-y-1/2 before:bg-border",
                                collapsed && "ml-1.5 h-8 w-8 justify-center",
                                active
                                  ? "bg-accent text-accent-foreground font-medium"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                locked && "cursor-not-allowed opacity-60",
                              )}
                            >
                              <ModuleIcon size={14} aria-hidden="true" className="shrink-0" />
                              {!collapsed && <span className="truncate">{module.name || module.id}</span>}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}

            {grouped.length === 0 && (
              <li className="px-2 py-1.5 text-xs text-muted-foreground">
                {!collapsed && (isSearching ? "No matching modules." : "No modules available.")}
              </li>
            )}

            <li>
              <Link
                href={locked ? pathname : "/runs"}
                onClick={(event) => {
                  if (locked) event.preventDefault();
                }}
                aria-current={pathname === "/runs" ? "page" : undefined}
                className={cn(
                  topLevelLinkClass,
                  pathname === "/runs"
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <History size={16} aria-hidden="true" />
                {!collapsed && "Run History"}
              </Link>
            </li>

            <li>
              <Link
                href={locked ? pathname : "/ai-llm"}
                onClick={(event) => {
                  if (locked) event.preventDefault();
                }}
                aria-current={pathname === "/ai-llm" ? "page" : undefined}
                className={cn(
                  topLevelLinkClass,
                  pathname === "/ai-llm"
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Bot size={16} aria-hidden="true" />
                {!collapsed && "AI/LLM"}
              </Link>
            </li>

            <li>
              <Link
                href={locked ? pathname : "/reporting"}
                onClick={(event) => {
                  if (locked) event.preventDefault();
                }}
                aria-current={pathname === "/reporting" ? "page" : undefined}
                className={cn(
                  topLevelLinkClass,
                  pathname === "/reporting"
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <BarChart2 size={16} aria-hidden="true" />
                {!collapsed && "Reporting"}
              </Link>
            </li>

            <li>
              <Link
                href={locked ? pathname : "/logs"}
                onClick={(event) => {
                  if (locked) event.preventDefault();
                }}
                aria-current={pathname === "/logs" ? "page" : undefined}
                className={cn(
                  topLevelLinkClass,
                  pathname === "/logs"
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <FileText size={16} aria-hidden="true" />
                {!collapsed && "Logs"}
              </Link>
            </li>
          </ul>
        </div>

        <div className="border-t border-border p-2">
          <Link
            href={locked ? pathname : "/settings"}
            onClick={(event) => {
              if (locked) event.preventDefault();
            }}
            aria-current={pathname.startsWith("/settings") ? "page" : undefined}
            className={cn(
              topLevelLinkClass,
              pathname.startsWith("/settings")
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Settings size={16} aria-hidden="true" />
            {!collapsed && "Settings"}
          </Link>
        </div>
      </div>
    </aside>
  );
}