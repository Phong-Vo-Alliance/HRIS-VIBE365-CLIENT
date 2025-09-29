import {
  Department,
  Project,
  Staff,
  StatusEntry,
  StatusKey,
  SHORT_BREAK_MAX,
  ReportRow,
  ApiResponse,
} from "@/domain/types";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const departments: Department[] = [
  { id: "dep-eng", name: "Engineering" },
  { id: "dep-qa", name: "Quality Assurance" },
  { id: "dep-pm", name: "Project Management" },
];

const projects: Project[] = [
  { id: "prj-alpha", name: "Alpha" },
  { id: "prj-beta", name: "Beta" },
  { id: "prj-gamma", name: "Gamma" },
];

const staff: Staff[] = [
  {
    id: "s01",
    firstName: "An",
    lastName: "Nguyen",
    departmentId: "dep-eng",
    projectIds: ["prj-alpha"],
    email: "an.nguyen@example.com",
    avatarUrl: "/avatars/s01.jfif",
    isActive: true,
  },
  {
    id: "s02",
    firstName: "Binh",
    lastName: "Tran",
    departmentId: "dep-qa",
    projectIds: ["prj-beta"],
    email: "binh.tran@example.com",
    avatarUrl: "/avatars/s02.jfif",
    isActive: true,
  },
  {
    id: "s03",
    firstName: "Chi",
    lastName: "Le",
    departmentId: "dep-pm",
    projectIds: ["prj-gamma"],
    email: "chi.le@example.com",
    avatarUrl: "/avatars/s03.jfif",
    isActive: false,
  },
  {
    id: "s04",
    firstName: "Dung",
    lastName: "Pham",
    departmentId: "dep-eng",
    projectIds: ["prj-alpha", "prj-beta"],
    email: "dung.pham@example.com",
    avatarUrl: "/avatars/s04.jfif",
    isActive: true,
  },
  {
    id: "s05",
    firstName: "Giang",
    lastName: "Vu",
    departmentId: "dep-qa",
    projectIds: ["prj-gamma"],
    email: "giang.vu@example.com",
    avatarUrl: "/avatars/s05.jfif",
    isActive: true,
  },
  {
    id: "s06",
    firstName: "Hanh",
    lastName: "Do",
    departmentId: "dep-pm",
    projectIds: ["prj-alpha", "prj-beta", "prj-gamma"],
    email: "hanh.do@example.com",
    avatarUrl: "/avatars/s06.jfif",
    isActive: true,
  },
  {
    id: "s07",
    firstName: "Sophia",
    lastName: "Miller",
    departmentId: "dep-qa",
    projectIds: ["prj-gamma"],
    email: "sophia.miller@example.com",
    avatarUrl: "/avatars/s07.jfif",
    isActive: true,
  },
  {
    id: "s08",
    firstName: "Kevin",
    lastName: "Anderson",
    departmentId: "dep-pm",
    projectIds: ["prj-beta", "prj-gamma"],
    email: "kevin.anderson@example.com",
    avatarUrl: "/avatars/s08.jfif",
    isActive: true,
  },
  {
    id: "s09",
    firstName: "Isabella",
    lastName: "Hoang",
    departmentId: "dep-eng",
    projectIds: ["prj-alpha", "prj-beta"],
    email: "isabella.hoang@example.com",
    avatarUrl: "/avatars/s09.jfif",
    isActive: true,
  },
  {
    id: "s10",
    firstName: "Michael",
    lastName: "Brown",
    departmentId: "dep-qa",
    projectIds: ["prj-gamma"],
    email: "michael.brown@example.com",
    avatarUrl: "/avatars/s10.jfif",
    isActive: true,
  },
  {
    id: "s11",
    firstName: "Daniel",
    lastName: "Johnson",
    departmentId: "dep-pm",
    projectIds: ["prj-beta", "prj-gamma"],
    email: "daniel.johnson@example.com",
    avatarUrl: "/avatars/s11.jfif",
    isActive: true,
  },
  {
    id: "s12",
    firstName: "Olivia",
    lastName: "Bui",
    departmentId: "dep-eng",
    projectIds: ["prj-alpha", "prj-beta"],
    email: "olivia.bui@example.com",
    avatarUrl: "/avatars/s12.jfif",
    isActive: true,
  },
  {
    id: "s13",
    firstName: "Ethan",
    lastName: "Wilson",
    departmentId: "dep-qa",
    projectIds: ["prj-gamma"],
    email: "ethan.wilson@example.com",
    avatarUrl: "",
    isActive: true,
  },
  {
    id: "s14",
    firstName: "Lucas",
    lastName: "Taylor",
    departmentId: "dep-pm",
    projectIds: ["prj-beta", "prj-gamma"],
    email: "lucas.taylor@example.com",
    avatarUrl: "",
    isActive: true,
  },
  {
    id: "s15",
    firstName: "Emily",
    lastName: "Martinez",
    departmentId: "dep-eng",
    projectIds: ["prj-alpha", "prj-beta"],
    email: "emily.martinez@example.com",
    avatarUrl: "",
    isActive: true,
  },
  {
    id: "s16",
    firstName: "Jason",
    lastName: "Huynh",
    departmentId: "dep-qa",
    projectIds: ["prj-gamma"],
    email: "jason.huynh@example.com",
    avatarUrl: "",
    isActive: true,
  },
  {
    id: "s17",
    firstName: "Alex",
    lastName: "Davis",
    departmentId: "dep-pm",
    projectIds: ["prj-beta", "prj-gamma"],
    email: "alex.davis@example.com",
    avatarUrl: "",
    isActive: true,
  },
  {
    id: "s18",
    firstName: "Hannah",
    lastName: "Moore",
    departmentId: "dep-eng",
    projectIds: ["prj-alpha", "prj-beta"],
    email: "hannah.moore@example.com",
    avatarUrl: "",
    isActive: true,
  },
  {
    id: "s19",
    firstName: "David",
    lastName: "Tran",
    departmentId: "dep-qa",
    projectIds: ["prj-gamma"],
    email: "david.tran@example.com",
    avatarUrl: "",
    isActive: true,
  },
  {
    id: "s20",
    firstName: "Samantha",
    lastName: "Clark",
    departmentId: "dep-pm",
    projectIds: ["prj-beta", "prj-gamma"],
    email: "samantha.clark@example.com",
    avatarUrl: "",
    isActive: true,
  },
  {
    id: "s21",
    firstName: "Anthony",
    lastName: "Nguyen",
    departmentId: "dep-eng",
    projectIds: ["prj-alpha", "prj-beta"],
    email: "anthony.nguyen@example.com",
    avatarUrl: "",
    isActive: true,
  },
  {
    id: "s22",
    firstName: "Thomas",
    lastName: "White",
    departmentId: "dep-qa",
    projectIds: ["prj-gamma"],
    email: "thomas.white@example.com",
    avatarUrl: "",
    isActive: true,
  },
  {
    id: "s23",
    firstName: "Victor",
    lastName: "Harris",
    departmentId: "dep-pm",
    projectIds: ["prj-beta", "prj-gamma"],
    email: "victor.harris@example.com",
    avatarUrl: "",
    isActive: true,
  },
  {
    id: "s24",
    firstName: "Jenny",
    lastName: "Lee",
    departmentId: "dep-eng",
    projectIds: ["prj-alpha", "prj-beta"],
    email: "jenny.lee@example.com",
    avatarUrl: "",
    isActive: true,
  },
];

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

  const onlineSet = new Set([
    "s19",
    "s20",
    "s21",
    "s01",
    "s03",
    "s05",
    "s07",
    "s08",
    "s09",
    "s10",
    "s11",
    "s12",
  ]);
  const warningSet = new Set(["s07", "s09", "s11"]); // staff with overtime
  const meetingSet = new Set(["s13", "s14", "s15", "s16", "s17", "s18"]); // staff in meeting

  staff.forEach((s) => {
    if (onlineSet.has(s.id)) {
      addEntry({ staffId: s.id, status: "login" as StatusKey, start: d(9, 15) });
    } else {
      addEntry({ staffId: s.id, status: "login" as StatusKey, start: d(8, 15) });
      addEntry({ staffId: s.id, status: "logout" as StatusKey, start: d(17, 15) });
    }
    if (warningSet.has(s.id)) {
      addEntry({
        staffId: s.id,
        status: "morning_break" as StatusKey,
        start: d(10, 0),
        end: d(10, 20),
      });
    }
    if (meetingSet.has(s.id)) {
      addEntry({
        staffId: s.id,
        status: "in_meeting" as StatusKey,
        start: d(14, 0),
        end: d(16, 0),
      });
    }
  });
})();

export const api = {
  listDepartments(): Promise<Department[]> {
    return Promise.resolve(departments);
  },
  listProjects(): Promise<Project[]> {
    return Promise.resolve(projects);
  },
  listStaff(): Promise<Staff[]> {
    return Promise.resolve(staff);
  },

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
