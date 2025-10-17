import { StatusEntry, StatusKey, SHORT_BREAK_MAX, ReportRow, ApiResponse } from "@/domain/types";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const statusEntries: StatusEntry[] = [];

function addEntry(
  e: Omit<StatusEntry, "id" | "totalMs" | "overtimeMs" | "maxMs"> &
    Partial<Pick<StatusEntry, "maxMs">>,
) {
  const id = "st_" + Math.random().toString(36).slice(2, 9);
  const totalMs = e.end ? new Date(e.end).getTime() - new Date(e.start).getTime() : undefined;
  let overtimeMs: number | undefined = undefined;
  let maxMs = e.maxMs;

  const shortKeys = ["morning_break", "lunch_break", "afternoon_break", "restroom"] as const;
  if (totalMs && (shortKeys as readonly string[]).includes(e.status)) {
    const max = SHORT_BREAK_MAX[e.status as keyof typeof SHORT_BREAK_MAX];
    if (typeof max === "number") {
      maxMs = max;
      overtimeMs = Math.max(0, totalMs - max);
    }
  }
  const entry: StatusEntry = { ...e, id, totalMs, overtimeMs, maxMs } as StatusEntry;
  statusEntries.push(entry);
  return entry;
}

// Seed data
(function seed() {
  const today = new Date();
  const d = (h: number, m: number) => {
    const t = new Date(today);
    t.setHours(h, m, 0, 0);
    return t.toISOString();
  };

  addEntry({ staffId: "s01", status: "lunch_break" as StatusKey, start: d(11, 0), end: d(11, 15) });
  addEntry({
    staffId: "s01",
    status: "work_in_ez_project" as StatusKey,
    start: d(10, 0),
    end: d(10, 45),
  });

  addEntry({ staffId: "s02", status: "in_training" as StatusKey, start: d(9, 30), end: d(11, 30) });
  addEntry({ staffId: "s02", status: "code_review" as StatusKey, start: d(13, 0), end: d(14, 10) });
  addEntry({ staffId: "s02", status: "in_meeting" as StatusKey, start: d(15, 10), end: d(16, 30) });

  addEntry({ staffId: "s03", status: "lunch_break" as StatusKey, start: d(10, 0) });

  addEntry({
    staffId: "s04",
    status: "work_in_ez_project" as StatusKey,
    projectId: "prj-alpha",
    start: d(9, 15),
  });

  addEntry({
    staffId: "s05",
    status: "work_in_ez_project" as StatusKey,
    projectId: "prj-beta",
    start: d(11, 0),
  });

  addEntry({
    staffId: "s06",
    status: "work_out_ez_project" as StatusKey,
    projectId: "prj-gamma",
    start: d(14, 0),
  });
})();

export const api = {
  async countOnlineNow(): Promise<number> {
    const onlineIds = new Set<string>();
    statusEntries.forEach((e) => {
      if (e.status === "login") onlineIds.add(e.staffId);
      if (e.status === "logout") onlineIds.delete(e.staffId);
    });
    return onlineIds.size;
  },
  async countWarningsToday(): Promise<number> {
    const today = new Date().toDateString();
    const staffWithWarnings = new Set<string>();
    statusEntries.forEach((e) => {
      const isToday = new Date(e.start).toDateString() === today;
      const isBreak = ["morning_break", "lunch_break", "afternoon_break", "restroom"].includes(
        e.status,
      );
      if (isToday && isBreak && (e.overtimeMs ?? 0) > 0) {
        staffWithWarnings.add(e.staffId);
      }
    });
    return staffWithWarnings.size;
  },
  async countProjectsChangedToday(): Promise<number> {
    const today = new Date().toDateString();
    const changed = new Set<string>();
    statusEntries.forEach((e) => {
      const isToday = new Date(e.start).toDateString() === today;
      if (isToday && e.projectId) changed.add(e.projectId);
    });
    return changed.size;
  },
  async entriesTodayByStaff(staffId: string): Promise<StatusEntry[]> {
    const today = new Date().toDateString();
    return statusEntries.filter(
      (e) => e.staffId === staffId && new Date(e.start).toDateString() === today,
    );
  },

  /// Export functions (stubs)
  // async exportReport(type: 'pdf' | 'excel', data: ReportRow[]): Promise<ApiResponse<Blob>> {
  //   await delay(1000);

  //   // Create a mock blob for download
  //   const content = type === 'pdf' ?
  //     'Mock PDF Report Data' :
  //     'Mock Excel Report Data';

  //   const blob = new Blob([content], {
  //     type: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //   });

  //   return { success: true, data: blob };
  // },
  async exportReport(type: "pdf" | "excel", data: ReportRow[]): Promise<ApiResponse<Blob>> {
    await delay(1000);

    if (type === "pdf") {
      // Tạo PDF mới
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Daily Report", 10, 10);

      let y = 20;
      data.forEach((row, i) => {
        const line = `${i + 1}. ${row.staffName} | ${row.department} | ${row.projects} | Total: ${row.totalWorkTime} | Break: ${row.totalBreakTime} | OT: ${row.overtimeMinutes}`;
        doc.text(line, 10, y);
        y += 8;
      });

      const blob = doc.output("blob");
      return { success: true, data: blob };
    }

    if (type === "excel") {
      // Convert data -> sheet
      const rows = data.map((r) => ({
        Name: r.staffName,
        Department: r.department,
        Projects: r.projects,
        Total: r.totalWorkTime,
        Break: r.totalBreakTime,
        Overtime: r.overtimeMinutes,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");

      const arrayBuf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([arrayBuf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      return { success: true, data: blob };
    }

    return { success: false, data: null };
  },
};
