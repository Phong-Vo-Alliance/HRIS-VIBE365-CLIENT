import { useEffect, useMemo, useState, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/mock";
import type { Staff, Department, Project, StatusEntry } from "@/domain/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Users,
  AlertTriangle,
  RefreshCcw,
  Layers,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { STATUS_LABELS } from "@/domain/types";

type RowDetail = { open: boolean; entries: StatusEntry[] | null; loading: boolean };

export default function DashboardPage() {
  const [kpi, setKpi] = useState({ online: 0, warnings: 0, projectChanges: 0 });
  const [staff, setStaff] = useState<Staff[]>([]);
  const [deps, setDeps] = useState<Department[]>([]);
  const [prjs, setPrjs] = useState<Project[]>([]);

  const [dep, setDep] = useState<string>("all");
  const [prj, setPrj] = useState<string>("all");
  const [q, setQ] = useState<string>("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [expanded, setExpanded] = useState<Record<string, RowDetail>>({});
  const [latestStatus, setLatestStatus] = useState<Record<string, StatusEntry | undefined>>({});
  const [activeFilter, setActiveFilter] = useState<"online" | "warnings" | null>(null);

  const expandVariants = {
    collapsed: { opacity: 0, height: 0, transition: { duration: 0.2 } },
    expanded: { opacity: 1, height: "auto", transition: { duration: 0.28 } },
  };

  useEffect(() => {
    api.listStaff().then(async (staffList) => {
      setStaff(staffList);
      const all = await Promise.all(
        staffList.map(async (s) => {
          const entries = await api.entriesTodayByStaff(s.id);
          const latest = entries
            .slice()
            .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())[0];
          return [s.id, latest] as const;
        }),
      );
      setLatestStatus(Object.fromEntries(all));
    });
    api.listDepartments().then(setDeps);
    api.listProjects().then(setPrjs);
    const loadKpi = async () => {
      const online = await api.countOnlineNow();
      const warnings = await api.countWarningsToday();
      const projectChanges = await api.countProjectsChangedToday();
      setKpi({ online, warnings, projectChanges });
    };
    loadKpi();
    const t = setInterval(loadKpi, 10_000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    let list = staff.filter((s) => {
      if (dep !== "all" && s.departmentId !== dep) return false;
      if (prj !== "all" && !s.projectIds.includes(prj)) return false;
      if (q) {
        const hay = [
          s.firstName,
          s.lastName,
          s.email ?? "",
          deps.find((d) => d.id === s.departmentId)?.name ?? "",
          ...s.projectIds.map((pid) => prjs.find((p) => p.id === pid)?.name ?? pid),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });

    // apply KPI filters
    if (activeFilter === "online") {
      list = list.filter((s) => {
        const latest = latestStatus[s.id]; // state cache đã fetch entries mới nhất cho từng staff
        return latest?.status !== "logout"; // set online if not logged out
      });
    }

    if (activeFilter === "warnings") {
      list = list.filter((s) => {
        const latest = latestStatus[s.id];
        return !!(latest?.overtimeMs && latest.overtimeMs > 0);
      });
    }

    return list;
  }, [staff, dep, prj, q, activeFilter, latestStatus, deps, prjs]);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / pageSize)),
    [filtered.length, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [dep, prj, q, pageSize]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const toggleExpand = async (id: string) => {
    let willCollapse = false;
    setExpanded((prev) => {
      const cur = prev[id];
      if (cur?.open) {
        willCollapse = true;
        return { ...prev, [id]: { open: false, entries: cur.entries ?? null, loading: false } };
      }
      return { ...prev, [id]: { open: true, entries: null, loading: true } };
    });
    if (willCollapse) return;
    const entries = await api.entriesTodayByStaff(id);
    // sort newest -> oldest
    const sorted = entries
      .slice()
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
    setExpanded((prev) => ({ ...prev, [id]: { open: true, entries: sorted, loading: false } }));
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const renderStatus = (status: string, overtime?: boolean) => {
    const label = STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status;

    if (overtime) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-yellow-500" /> {label}
        </span>
      );
    }
    const colorMap: Record<string, string> = {
      login: "bg-green-100 text-green-700",
      logout: "bg-gray-200 text-gray-700",
      morning_break: "bg-yellow-100 text-yellow-700",
      lunch_break: "bg-yellow-100 text-yellow-700",
      afternoon_break: "bg-yellow-100 text-yellow-700",
      restroom: "bg-yellow-100 text-yellow-700",
      in_meeting: "bg-blue-100 text-blue-700",
      staff_meeting: "bg-blue-100 text-blue-700",
      in_training: "bg-blue-100 text-blue-700",
      code_review: "bg-purple-100 text-purple-700",
      work_in_ez_project: "bg-purple-100 text-purple-700",
      // … add more as needed
    };

    const color = colorMap[status] ?? "bg-secondary text-secondary-foreground";
    return <span className={`px-2 py-0.5 rounded-full text-xs ${color}`}>{label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Employees ONLINE</CardTitle>
            <Users className="h-6 w-6 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">{kpi.online}</div>
              <button onClick={() => setActiveFilter("online")} className="nav-link text-sm">
                View all
              </button>
            </div>

            <p className="text-xs text-muted-foreground">Updated every 10s</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Employees with WARNINGS (today)</CardTitle>
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">{kpi.warnings}</div>
              {/* <Link to="/app/report?preset=warnings" className="nav-link text-sm">View all</Link> */}
              <button onClick={() => setActiveFilter("warnings")} className="nav-link text-sm">
                View all
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projects changed STATUS (today)</CardTitle>
            <Layers className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpi.projectChanges}</div>
            <p className="text-xs text-muted-foreground">Since midnight</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Hired Staff</CardTitle>
            <Badge variant="outline" className="ml-2 px-2 mt-0.5">
              {filtered.length} total
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              api.listStaff().then(setStaff);
              api.listDepartments().then(setDeps);
              api.listProjects().then(setPrjs);
            }}
            title="Refresh data"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-10"
                  placeholder="Search by name, department, or project..."
                />
              </div>
            </div>
            <div className="w-40">
              <Select value={dep} onValueChange={setDep}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {deps.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={prj} onValueChange={setPrj}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {prjs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeFilter && (
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-full bg-primary/10 px-2 py-1 flex items-center gap-2">
                <span className="text-sm">
                  {activeFilter === "online"
                    ? "Filtering Online Employees"
                    : "Filtering Warning Employees"}
                </span>
                <button
                  onClick={() => setActiveFilter(null)}
                  className="text-xs text-muted-foreground"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-2 w-8"></th>
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Department</th>
                  <th className="py-2 pr-2">Projects</th>
                  <th className="py-2 pr-2">Current Status</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((s, idx) => {
                  const det = expanded[s.id];
                  //const latest = det?.entries ? det.entries[0] : undefined;
                  const latest = latestStatus[s.id];
                  // const isOvertime = !!(latest?.overtimeMs && latest.overtimeMs > 0);

                  return (
                    <Fragment key={s.id}>
                      <tr
                        className="border-t hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleExpand(s.id)}
                      >
                        <td className="py-2 pr-2 text-center">
                          {det?.open ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </td>
                        <td className="py-2 pr-2">{(page - 1) * pageSize + idx + 1}</td>
                        <td className="py-2 pr-2 flex items-center gap-2">
                          {s.avatarUrl ? (
                            <img
                              src={s.avatarUrl}
                              alt={`${s.firstName} ${s.lastName}`}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                          ) : (
                            ""
                          )}
                          {!s.avatarUrl ? (
                            <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                              {initials(s.firstName + " " + s.lastName)}
                            </div>
                          ) : (
                            ""
                          )}
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="py-2 pr-2">
                          {deps.find((d) => d.id === s.departmentId)?.name ?? ""}
                        </td>
                        <td className="py-2 pr-2">
                          {s.projectIds
                            .map((pid) => prjs.find((p) => p.id === pid)?.name ?? pid)
                            .join(", ")}
                        </td>
                        <td className="py-2 pr-2">
                          {latest
                            ? renderStatus(
                                latest.status,
                                !!(latest.overtimeMs && latest.overtimeMs > 0),
                              )
                            : renderStatus("login")}
                        </td>
                      </tr>
                      <AnimatePresence initial={false}>
                        {det?.open && (
                          <tr>
                            <td colSpan={6}>
                              <motion.div
                                initial="collapsed"
                                animate="expanded"
                                exit="collapsed"
                                variants={expandVariants}
                                style={{ overflow: "hidden" }}
                                className="p-3 border-t rounded-md bg-muted/40"
                              >
                                {det.loading && (
                                  <div className="text-sm text-muted-foreground">
                                    Loading details…
                                  </div>
                                )}
                                {!det.loading && det.entries && (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs">
                                      <thead className="text-left text-muted-foreground">
                                        <tr>
                                          <th className="py-2 pr-2">Status</th>
                                          <th className="py-2 pr-2">Start</th>
                                          <th className="py-2 pr-2">End</th>
                                          <th className="py-2 pr-2">Duration</th>
                                          <th className="py-2 pr-2">Max</th>
                                          <th className="py-2 pr-2">Overtime</th>
                                          <th className="py-2 pr-2">Note</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {det.entries.map((e) => {
                                          const fmt = (iso?: string) =>
                                            iso ? new Date(iso).toLocaleTimeString("en-GB") : "";
                                          const hhmmss = (ms?: number) => {
                                            if (!ms) return "";
                                            const s = Math.floor(ms / 1000);
                                            const h = Math.floor(s / 3600);
                                            const m = Math.floor((s % 3600) / 60);
                                            const sec = s % 60;
                                            return [h, m, sec]
                                              .map((v) => String(v).padStart(2, "0"))
                                              .join(":");
                                          };
                                          return (
                                            <tr key={e.id} className="border-t">
                                              <td className="py-2 pr-2">
                                                {/* <span className={`px-2 py-0.5 rounded-full ${e.overtimeMs ? "bg-yellow-100 text-yellow-900" : "bg-secondary text-secondary-foreground"}`}> */}
                                                {renderStatus(
                                                  e.status,
                                                  !!(e.overtimeMs && e.overtimeMs > 0),
                                                )}
                                                {/* </span> */}
                                              </td>
                                              <td className="py-2 pr-2">{fmt(e.start)}</td>
                                              <td className="py-2 pr-2">{fmt(e.end)}</td>
                                              <td className="py-2 pr-2">{hhmmss(e.totalMs)}</td>
                                              <td className="py-2 pr-2">{hhmmss(e.maxMs)}</td>
                                              <td className="py-2 pr-2">
                                                {e.overtimeMs ? (
                                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-destructive/15 text-destructive">
                                                    ⚠ OVERTIME
                                                  </span>
                                                ) : (
                                                  ""
                                                )}
                                              </td>
                                              <td className="py-2 pr-2">{e.note ?? ""}</td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page</span>
                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger className="h-8 w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {page} / {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  «
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ‹
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page === pageCount}
                >
                  ›
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pageCount)}
                  disabled={page === pageCount}
                >
                  »
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
