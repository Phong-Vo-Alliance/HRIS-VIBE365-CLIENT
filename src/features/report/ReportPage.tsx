import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/mock";
import type { Department, Project, Staff } from "@/domain/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Building2, Layers, FileDown, FileText } from "lucide-react";

type Row = { staff: Staff; totalMs: number; breakMs: number; overtimeMs: number };

export default function ReportPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [deps, setDeps] = useState<Department[]>([]);
  const [prjs, setPrjs] = useState<Project[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [dep, setDep] = useState<string>("all");
  const [selProjects, setSelProjects] = useState<string[]>([]);
  // const [searchParams] = useSearchParams();
  // const [showOnlyWarnings, setShowOnlyWarnings] = useState(false);

  useEffect(() => {
    api.listDepartments().then(setDeps);
    api.listProjects().then(setPrjs);
    api.listStaff().then(setStaff);
  }, []);

  // useEffect(() => {
  //   const preset = searchParams.get("preset");
  //   if (preset === "warnings") {
  //     setShowOnlyWarnings(true);
  //   }
  // }, [searchParams]);

  const rows: Row[] = useMemo(() => {
    const list = staff
      .filter((s) => (dep === "all" ? true : s.departmentId === dep))
      .map((s) => ({
        staff: s,
        totalMs: 8 * 3600_000,
        breakMs: 30 * 60_000,
        overtimeMs: s.id.endsWith("1") ? 15 * 60_000 : 0, // demo overtime
      }));

    // if (showOnlyWarnings) {
    //   list = list.filter(r => r.overtimeMs > 0);
    // }
    return list;
  }, [staff, dep, date, selProjects]);

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

  const exportCsv = () => {
    /* giữ nguyên logic */
  };
  const exportPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Daily Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Date
              </Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="min-w-[200px]">
              <Label className="flex items-center gap-1">
                <Building2 className="h-4 w-4" /> Department
              </Label>
              <Select value={dep} onValueChange={setDep}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {deps.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="flex items-center gap-1">
                <Layers className="h-4 w-4" /> Projects
              </Label>
              <div className="flex flex-wrap gap-2">
                {prjs.map((p) => {
                  const on = selProjects.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() =>
                        setSelProjects(
                          on ? selProjects.filter((id) => id !== p.id) : [...selProjects, p.id],
                        )
                      }
                      className={`px-3 py-1 rounded-full border ${on ? "bg-primary text-primary-foreground" : "bg-background"}`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

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
                  <tr key={r.staff.id} className="border-t">
                    <td className="py-2 pr-2">{i + 1}</td>
                    <td className="py-2 pr-2">
                      {r.staff.firstName} {r.staff.lastName}
                    </td>
                    <td className="py-2 pr-2">
                      {deps.find((d) => d.id === r.staff.departmentId)?.name ?? ""}
                    </td>
                    <td className="py-2 pr-2">
                      {r.staff.projectIds
                        .map((pid) => prjs.find((p) => p.id === pid)?.name ?? pid)
                        .join(", ")}
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
                <tr className="border-t font-semibold bg-muted/40">
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

          <div className="flex gap-2">
            <Button onClick={exportPdf} className="inline-flex items-center gap-1">
              <FileText className="h-4 w-4" /> Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={exportCsv}
              className="inline-flex items-center gap-1"
            >
              <FileDown className="h-4 w-4" /> Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
