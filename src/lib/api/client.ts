import { ApiResponse, ReportRow } from "@/domain/types";
import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/auth.store";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { logout, refresh } = useAuthStore.getState();
  const headers = new Headers(init.headers);
  if (localStorage.getItem("auth_token")) {
    headers.set("Authorization", `Bearer ${localStorage.getItem("auth_token")}`);
  }

  const res = await fetch(`${env.API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshed = await refresh();
    if (refreshed) {
      return http<T>(path, init);
    }
    logout();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => http<T>(path),
  post: <T>(path: string, body?: unknown) =>
    http<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  put: <T>(path: string, body?: unknown) =>
    http<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    http<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => http<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, form: Record<string, string>) => {
    const body = new URLSearchParams(form).toString();
    return http<T>(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
  },
  postFormFormData: <T>(path: string, form: FormData) => {
    return http<T>(path, {
      method: "POST",
      body: form,
    });
  }, /// Export functions (stubs)
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
