import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ClientDepartment, ClientProject, Staff } from "@/domain/types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Building2, Layers, FileDown, FileText, Filter, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ClientStaffStatusModel, ResponseModel, SingleItemResponseModel } from "@/type/all_types";
import { api } from "@/lib/api/client";

type Row = { staff: Staff; totalMs: number; breakMs: number; overtimeMs: number };

export default function ReportPage() {
  // --- Data sources ---
  const [deps, setDeps] = useState<ClientDepartment[]>([]);
  const [prjs, setPrjs] = useState<ClientProject[]>([]);
  // const [statuses, setStatus] = useState<ClientStaffStatusModel[]>([]);
  const [staff /*,setStaff*/] = useState<Staff[]>([]);

  // --- Pending filters (UI inputs) ---
  const [pendingDate, setPendingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [pendingDep, setPendingDep] = useState<string>("all");
  const [pendingSelProjects, setPendingSelProjects] = useState<string[]>([]);

  // --- Applied filters (used for report) ---
  // const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dep, setDep] = useState<string>("all");
  const [selProjects, setSelProjects] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState<"pdf" | "excel" | null>(null);

  useEffect(() => {
    //initialize data

    // connection = new signalR.HubConnectionBuilder()
    // .withUrl(`${env.API_BASE_URL}/NotificationHub`, {
    //   accessTokenFactory: () => localStorage.getItem('auth_token') || '',
    //   // headers: {
    //   //   Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
    //   // },

    // })
    // .withStatefulReconnect()
    // .build();

    //         if (connection) {
    //         console.warn("SignalR connection:", connection)
    //         connection
    //           .start()
    //           .then(() => {
    //             connection.on("ReceiveMessage", message => {
    //               console.warn("SignalR receive msg:", message)
    //               //tuy vao type gi se emit event do
    //               if (message && message.type) {
    //                 // HEE.emit(`signalR_${message.type}`, message)
    //               }
    //             })
    //           })
    //           .catch(error =>
    //             console.error("SignalR Error Connection SingalR:", error)
    //           )
    //       }
    // // Start the connection
    // connection
    //   .start()
    //   .then(() => {
    //     console.log('SignalR connected successfully!');
    //   })
    //   .catch((err) => {
    //     console.error('Error connecting to SignalR:', err);
    //   });
    // // Example: Listening to a server-side method
    // connection.on('ReceiveMessage', (user, message) => {
    //   console.log(`Message from ${user}: ${message}`);
    // });

    api
      .post<
        SingleItemResponseModel<ResponseModel<ClientDepartment>>
      >("/api/v1/ClientDepartment/List", {})
      .then((ClientDepartmentList) => {
        const x = ClientDepartmentList.Data.Data;
        setDeps(x);
        api
          .post<
            SingleItemResponseModel<ResponseModel<ClientProject>>
          >("/api/v1/ClientProject/List", {})
          .then((ClientProjectList) => {
            const x = ClientProjectList.Data.Data;
            setPrjs(x);
            api
              .post<SingleItemResponseModel<ResponseModel<ClientStaffStatusModel>>>(
                "/api/v1/ClientStaffStatus/List",
                {},
              )
              .then
              // (clientStaffStatusModel)=>{
              // let x = clientStaffStatusModel.Data.Data;
              // setStatus(x);
              // }
              ();
          });
      });

    // setTimeout(loadKpi,10000);
  }, []);

  // --- Rows for report ---
  const rows: Row[] = useMemo(() => {
    const list = staff
      .filter((s) => (dep === "all" ? true : s.ClientDepartment === dep))
      .map((s) => ({
        staff: s,
        totalMs: 8 * 3600_000,
        breakMs: 30 * 60_000,
        overtimeMs: s.Id.endsWith("1") ? 15 * 60_000 : 0, // demo overtime
      }));

    // Project filter
    if (selProjects.length > 0) {
      return list.filter((r) => r.staff.ClientProjects.some((pid) => selProjects.includes(pid)));
    }

    return list;
  }, [staff, dep, selProjects]);

  const sum = rows.reduce(
    (acc, r) => {
      acc.totalMs += r.totalMs;
      acc.breakMs += r.breakMs;
      acc.overtimeMs += r.overtimeMs;
      return acc;
    },
    { totalMs: 0, breakMs: 0, overtimeMs: 0 },
  );

  const hhmm = (ms: number) => {
    const m = Math.round(ms / 60000);
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  const handleExport = async (type: "pdf" | "excel") => {
    if (rows.length === 0) {
      toast({
        title: "No Data",
        description: "Generate a report first before exporting.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(type);

    // try {
    //   const reportRows = rows.map((r) => ({
    //     staffId: r.staff.Id,
    //     staffName: `${r.staff.FirstName} ${r.staff.LastName}`,
    //     department: deps.find((d) => d.Id === r.staff.ClientDepartment)?.Name ?? "",
    //     projects: r.staff.ClientProjects
    //       .map((pid) => prjs.find((p) => p.Id === pid)?.Name ?? pid)
    //       .join(", "),
    //     totalWorkTime: r.totalMs,
    //     breakTime: r.breakMs,
    //     overtime: r.overtimeMs,
    //     totalBreakTime: r.breakMs, // Added to match ReportRow
    //     overtimeMinutes: Math.round(r.overtimeMs / 60000), // Added to match ReportRow
    //   }));
    //   const response = await api.exportReport(type, reportRows);

    //   if (response.success && response.data) {
    //     // Create download link
    //     const url = URL.createObjectURL(response.data);
    //     const link = document.createElement("a");
    //     link.href = url;
    //     link.download = `staff-report-${date}.${type === "pdf" ? "pdf" : "xlsx"}`;
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //     URL.revokeObjectURL(url);

    //     toast({
    //       title: "Export Successful",
    //       description: `Report exported as ${type.toUpperCase()} successfully.`,
    //     });
    //   }
    // } catch (error) {
    //   toast({
    //     title: "Export Failed",
    //     description:
    //       "Failed to export report. Please try again." +
    //       (error instanceof Error ? `(${error.message})` : ""),
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsExporting(null);
    // }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle>Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Date */}
            <div>
              <Label className="flex items-center gap-1 pb-2">
                <Calendar className="h-4 w-4" /> Date
              </Label>
              <Input
                type="date"
                value={pendingDate}
                onChange={(e) => setPendingDate(e.target.value)}
              />
            </div>

            {/* Department */}
            <div>
              <Label className="flex items-center gap-1 pb-2">
                <Building2 className="h-4 w-4" /> Department
              </Label>
              <Select value={pendingDep} onValueChange={setPendingDep}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {deps.map((d) => (
                    <SelectItem key={d.Id} value={d.Id}>
                      {d.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Projects */}
            <div>
              <Label className="flex items-center gap-1 pb-2">
                <Layers className="h-4 w-4" /> Projects
              </Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background">
                {prjs.map((p) => {
                  const on = pendingSelProjects.includes(p.Id);
                  return (
                    <Badge
                      key={p.Id}
                      variant={pendingSelProjects.includes(p.Id) ? "default" : "outline"}
                      onClick={() =>
                        setPendingSelProjects(
                          on
                            ? pendingSelProjects.filter((id) => id !== p.Id)
                            : [...pendingSelProjects, p.Id],
                        )
                      }
                      className={`px-3 py-1 rounded-full border transition-colors ${
                        on ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                      }`}
                    >
                      {p.Name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generate Report button aligned right */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                // setDate(pendingDate);
                setDep(pendingDep);
                setSelProjects(pendingSelProjects);
              }}
            >
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Staff Activity Report</CardTitle>
            </div>

            {rows.length > 0 && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => handleExport("pdf")}
                  disabled={isExporting === "pdf"}
                >
                  {isExporting === "pdf" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => handleExport("excel")}
                  disabled={isExporting === "excel"}
                >
                  {isExporting === "excel" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  Export Excel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Name</th>
                    <th className="py-2 pr-2">Department</th>
                    <th className="py-2 pr-2">Projects</th>
                    <th className="py-2 pr-2">Total time</th>
                    <th className="py-2 pr-2">Break time</th>
                    <th className="py-2 pr-2">Overtime</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={r.staff.Id}
                      className="border-t odd:bg-white even:bg-muted/30 hover:bg-muted/50"
                    >
                      <td className="py-2 pr-2">{i + 1}</td>
                      <td className="py-2 pr-2">
                        {r.staff.FirstName} {r.staff.LastName}
                      </td>
                      <td className="py-2 pr-2">
                        {deps.find((d) => d.Id === r.staff.ClientDepartment)?.Name ?? ""}
                      </td>
                      <td className="py-2 pr-2">
                        {r.staff.ClientProjects.map(
                          (pid) => prjs.find((p) => p.Id === pid)?.Name ?? pid,
                        ).join(", ")}
                      </td>
                      <td className="py-2 pr-2">{hhmm(r.totalMs)}</td>
                      <td className="py-2 pr-2">{hhmm(r.breakMs)}</td>
                      <td className="py-2 pr-2">
                        {r.overtimeMs > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-destructive/10 text-destructive">
                            ⚠ {hhmm(r.overtimeMs)}
                          </span>
                        ) : (
                          hhmm(r.overtimeMs)
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t font-semibold bg-gradient-to-r from-warning/40 to-accent/30">
                    <td className="py-2 pr-2" colSpan={4}>
                      Total
                    </td>
                    <td className="py-2 pr-2">{hhmm(sum.totalMs)}</td>
                    <td className="py-2 pr-2">{hhmm(sum.breakMs)}</td>
                    <td className="py-2 pr-2">{hhmm(sum.overtimeMs)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-10">
              <p className="text-lg font-medium text-muted-foreground">No Report Generated</p>
              <p className="text-sm text-muted-foreground">
                No data to display. Please adjust the filters and generate the report.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
