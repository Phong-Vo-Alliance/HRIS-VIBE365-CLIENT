import { useEffect, useMemo, useState, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/client";
import { Staff, ClientDepartment, ClientProject } from "@/domain/types";
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
import {
  ClientStaffStatusModel,
  ClientStaffTimeTrackingModel,
  ResponseModel,
  SingleItemResponseModel,
} from "@/type/all_types";

// Create a connection to the SignalR Hub

type RowDetail = {
  open: boolean;
  entries: ClientStaffTimeTrackingModel[] | null;
  loading: boolean;
};
let staffs: Staff[] = [];
export default function DashboardPage() {
  const [kpi, setKpi] = useState({ online: 0, warnings: 0, projectChanges: 0 });
  const [staff, setStaff] = useState<Staff[]>([]);
  const [deps, setDeps] = useState<ClientDepartment[]>([]);
  const [prjs, setPrjs] = useState<ClientProject[]>([]);
  const [statuses, setStatuses] = useState<ClientStaffStatusModel[]>([]);
  const [dep, setDep] = useState<string>("all");
  const [prj, setPrj] = useState<string>("all");

  const [q, setQ] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [expanded, setExpanded] = useState<Record<string, RowDetail>>({});
  const [activeFilter, setActiveFilter] = useState<"online" | "warnings" | null>(null);

  const expandVariants = {
    collapsed: { opacity: 0, height: 0, transition: { duration: 0.2 } },
    expanded: { opacity: 1, height: "auto", transition: { duration: 0.28 } },
  };
  const loadKpi = () => {
    api
      .post<SingleItemResponseModel<ResponseModel<Staff>>>("/api/v1/ClientStaff/List", {})
      .then((staffList) => {
        staffs = staffList.Data.Data;
        setStaff(staffs);
        let online = 0;
        let warnings = 0;
        const projectChanges = prjs.length;
        for (const s of staffs) {
          if (s.SavedTimeTracking != null && s.SavedTimeTracking.length > 0) {
            const status = statuses.find((_) => _.Id == s.SavedTimeTracking[0].StatusDefinitionId);
            if (!status?.IsLogoutStatus) {
              online += 1;
            }
            for (const _s of s.SavedTimeTracking) {
              const _status = statuses.find((_) => _.Id == _s.StatusDefinitionId);
              if (
                (_status?.DefaultMaxTime ?? 0) > 0 &&
                (_s.DurationSeconds ?? 0) > (_status?.DefaultMaxTime ?? 0)
              ) {
                warnings += 1;
                break;
              }
            }
          }
        }
        setKpi({ online, warnings, projectChanges });
      });
  };
  // let statusEntries :StatusEntry[] = [];
  // async function entriesTodayByStaff(staffId: string): Promise<StatusEntry[]> {
  //   const today = new Date().toDateString();
  //   return statusEntries.filter(
  //     (e) => e.staffId === staffId && new Date(e.start).toDateString() === today,
  //   );
  // }
  useEffect(() => {
    (async () => {
      try {
        // load departments
        const depResp = await api.post<SingleItemResponseModel<ResponseModel<ClientDepartment>>>(
          "/api/v1/ClientDepartment/List",
          {},
        );
        const depsData = depResp.Data.Data;
        setDeps(depsData);

        // load projects
        const prjResp = await api.post<SingleItemResponseModel<ResponseModel<ClientProject>>>(
          "/api/v1/ClientProject/List",
          {},
        );
        const prjsData = prjResp.Data.Data;
        setPrjs(prjsData);

        // load statuses
        const statusResp = await api.post<
          SingleItemResponseModel<ResponseModel<ClientStaffStatusModel>>
        >("/api/v1/ClientStaffStatus/List", {});
        const statusesData = statusResp.Data.Data;
        setStatuses(statusesData);

        // now load staff and compute KPI using the freshly fetched prjsData/statusesData
        const staffResp = await api.post<SingleItemResponseModel<ResponseModel<Staff>>>(
          "/api/v1/ClientStaff/List",
          {},
        );
        staffs = staffResp.Data.Data;
        setStaff(staffs);

        let online = 0;
        let warnings = 0;
        const projectChanges = prjsData.length;

        for (const s of staffs) {
          if (s.SavedTimeTracking != null && s.SavedTimeTracking.length > 0) {
            const first = s.SavedTimeTracking[0];
            const statusDef = statusesData.find((st) => st.Id === first.StatusDefinitionId);
            if (!statusDef?.IsLogoutStatus) {
              online += 1;
            }

            for (const _s of s.SavedTimeTracking) {
              const st = statusesData.find((x) => x.Id === _s.StatusDefinitionId);
              if (
                (st?.DefaultMaxTime ?? 0) > 0 &&
                (_s.DurationSeconds ?? 0) > (st?.DefaultMaxTime ?? 0)
              ) {
                warnings += 1;
                break;
              }
            }
          }
        }
        setKpi({ online, warnings, projectChanges });
      } catch (err) {
        console.error("Failed to initialize dashboard data", err);
      }
    })();
  }, []);
  const filtered = useMemo(() => {
    let list = staff.filter((s) => {
      if (dep !== "all" && s.ClientDepartment !== dep) return false;
      if (prj !== "all" && !s.ClientProjects.includes(prj)) return false;
      if (q) {
        const hay = [
          s.FirstName,
          s.LastName,
          s.EmailAddress ?? "",
          deps.find((d) => d.Id === s.ClientDepartment)?.Name ?? "",
          ...s.ClientProjects.map((pid) => prjs.find((p) => p.Id === pid)?.Name ?? pid),
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
        if (s.SavedTimeTracking == null || s.SavedTimeTracking.length == 0) {
          return false;
        } else {
          return !statuses.find((_) => _.Id == s.SavedTimeTracking[0].StatusDefinitionId)
            ?.IsLogoutStatus;
        }
      });
    }

    if (activeFilter === "warnings") {
      list = list.filter((s) => {
        let r = false;
        s.SavedTimeTracking.forEach((element) => {
          element.DefaultMaxTime =
            statuses.find((_) => _.Id == element.StatusDefinitionId)?.DefaultMaxTime ?? 0;
          if (
            element.DefaultMaxTime > 0 &&
            (element.DurationSeconds ?? 0) > element.DefaultMaxTime
          ) {
            r = true;
          }
        });
        return r;
      });
    }
    return list;
  }, [staff, dep, q, activeFilter, statuses, deps, prjs, prj]);

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
    const entries = staff.find((_) => _.Id == id)?.SavedTimeTracking ?? [];
    // sort newest -> oldest
    const sorted = entries.slice().sort((a, b) => (b.TimeStart ?? 0) - (a.TimeStart ?? 0));
    setExpanded((prev) => ({ ...prev, [id]: { open: true, entries: sorted, loading: false } }));
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const renderStatus = (status: ClientStaffStatusModel | null, overtime?: boolean) => {
    if (overtime) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          {status?.WorkStatusName}
        </span>
      );
    } else {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
          style={{
            backgroundColor: status?.BackgroundColor ?? "transparent",
            color: status?.Color ?? "transparent",
            fontWeight: "bold",
          }}
        >
          {status?.WorkStatusName}
        </span>
      );
    }
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
              <div className="text-3xl font-bold text-green-500">{kpi.online}</div>
              <button onClick={() => setActiveFilter("online")} className="nav-link text-sm">
                View all
              </button>
            </div>

            <p className="text-xs text-muted-foreground">Updated every 10s</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-warning">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Employees with WARNINGS (today)</CardTitle>
            <AlertTriangle className="h-6 w-6 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-warning">{kpi.warnings}</div>
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
            <div className="text-3xl font-bold text-blue-500">{kpi.projectChanges}</div>
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
              loadKpi();
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
                    <SelectItem key={d.Id} value={d.Id}>
                      {d.Name}
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
                    <SelectItem key={p.Id} value={p.Id}>
                      {p.Name}
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
                  const det = expanded[s.Id];
                  //const latest = det?.entries ? det.entries[0] : undefined;
                  // const latest = latestStatus[s.Id];
                  // const isOvertime = !!(latest?.overtimeMs && latest.overtimeMs > 0);
                  return (
                    <Fragment key={s.Id}>
                      <tr
                        className="border-t hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleExpand(s.Id)}
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
                          {s.ProfilePicturePath ? (
                            <img
                              src={s.ProfilePicturePath}
                              alt={`${s.FirstName} ${s.LastName}`}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                          ) : (
                            ""
                          )}
                          {!s.ProfilePicturePath ? (
                            <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                              {initials(s.FirstName + " " + s.LastName)}
                            </div>
                          ) : (
                            ""
                          )}
                          {s.FirstName} {s.LastName}
                        </td>
                        <td className="py-2 pr-2">
                          {deps.find((d) => d.Id === s.ClientDepartment)?.Name ??
                            s.ClientDepartment}
                        </td>
                        <td className="py-2 pr-2">
                          {s.ClientProjects.map(
                            (pid) => prjs.find((p) => p.Id === pid)?.Name ?? pid,
                          ).join(", ")}
                        </td>
                        <td className="py-2 pr-2">
                          {s.SavedTimeTracking != null && s.SavedTimeTracking.length > 0
                            ? renderStatus(
                                statuses.find(
                                  (_) => _.Id == s.SavedTimeTracking[0].StatusDefinitionId,
                                ) ?? null,
                                !!(
                                  (statuses.find(
                                    (_) => _.Id == s.SavedTimeTracking[0].StatusDefinitionId,
                                  )?.DefaultMaxTime ?? 0) > 0 &&
                                  (s.SavedTimeTracking[0].DurationSeconds ?? 0) -
                                    (statuses.find(
                                      (_) => _.Id == s.SavedTimeTracking[0].StatusDefinitionId,
                                    )?.DefaultMaxTime ?? 0) >
                                    0
                                ),
                              )
                            : "Offline"}
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
                                          // const fmt = (iso?: string) =>
                                          //   iso ? new Date(iso).toLocaleTimeString("en-GB") : "";
                                          const hhmmss = (s?: number) => {
                                            if (!s) return "";
                                            const h = Math.floor(s / 3600);
                                            const m = Math.floor((s % 3600) / 60);
                                            const sec = s % 60;
                                            return [h, m, sec]
                                              .map((v) => String(v).padStart(2, "0"))
                                              .join(":");
                                          };
                                          const max_time = statuses.find(
                                            (_) => _.Id == e.StatusDefinitionId,
                                          )?.DefaultMaxTime;
                                          return (
                                            <tr key={e.Id} className="border-t">
                                              <td className="py-2 pr-2">
                                                {renderStatus(
                                                  statuses.find(
                                                    (_) => _.Id == e.StatusDefinitionId,
                                                  ) ?? null,
                                                  !!(
                                                    max_time &&
                                                    (e.DurationSeconds ?? 0) - (max_time ?? 0) > 0
                                                  ),
                                                )}
                                              </td>
                                              <td className="py-2 pr-2">
                                                {e.TimeStart
                                                  ? new Date(e.TimeStart ?? 0).toISOString()
                                                  : ""}
                                              </td>
                                              <td className="py-2 pr-2">
                                                {e.TimeEnd
                                                  ? new Date(e.TimeEnd ?? 0).toISOString()
                                                  : ""}
                                              </td>
                                              <td className="py-2 pr-2">
                                                {hhmmss(e.DurationSeconds ?? 0)}
                                              </td>
                                              <td className="py-2 pr-2">{hhmmss(max_time ?? 0)}</td>
                                              <td className="py-2 pr-2">
                                                {max_time &&
                                                (e.DurationSeconds ?? 0) - (max_time ?? 0) > 0 ? (
                                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-destructive/15 text-destructive">
                                                    ⚠ OVERTIME
                                                  </span>
                                                ) : (
                                                  ""
                                                )}
                                              </td>
                                              <td className="py-2 pr-2">{e.Note ?? ""}</td>
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
