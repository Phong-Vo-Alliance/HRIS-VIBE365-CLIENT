import { ClientStaffTimeTrackingModel } from "@/type/all_types";

export type ClientDepartment = {
  Id: string;
  Name: string;
  Code: string;
  Description: string;
  BusinessClientId: string;
  StaffList: string;
  StaffCount: number;
  EditBtn: string;
};

export type ClientProject = {
  Id: string;
  Name: string;
  Code: string;
  Country: string;
  Description: string;
  BusinessClientId: string;
  StaffCount: number;
  StaffString: string;
  EditBtn: string;
};

export type Staff = {
  Id: string;
  FirstName: string;
  LastName: string;
  MiddleName: string;
  ClientDepartment: string;
  ClientProjects: string[];
  EmailAddress?: string;
  ProfilePicturePath?: string;
  StaffStatusId: boolean;
  // TimeTrackingHistory: ClientStaffTimeTrackingModel[];
  SavedTimeTracking: ClientStaffTimeTrackingModel[];
  SumOverTime: number | 0;
  SumTime: number | 0;
  SumBreakTime: number | 0;
};

export type StatusKey =
  | "login"
  | "logout"
  | "morning_break"
  | "lunch_break"
  | "afternoon_break"
  | "restroom"
  | "work_in_ez_project"
  | "work_out_ez_project"
  | "it_on_floor"
  | "it_project"
  | "it_management"
  | "in_meeting"
  | "staff_meeting"
  | "in_training"
  | "the_juice"
  | "birthday_greeting"
  | "code_review";

export type StatusEntry = {
  id: string;
  staffId: string;
  status: StatusKey;
  projectId?: string;
  start: string; // ISO
  end?: string; // ISO
  totalMs?: number;
  maxMs?: number;
  overtimeMs?: number;
  note?: string;
};

export const SHORT_BREAK_MAX: Record<
  Extract<StatusKey, "morning_break" | "lunch_break" | "afternoon_break" | "restroom">,
  number
> = {
  morning_break: 5 * 60 * 1000,
  lunch_break: 5 * 60 * 1000,
  afternoon_break: 5 * 60 * 1000,
  restroom: 5 * 60 * 1000,
};

export interface ReportRow {
  staffId: string;
  staffName: string;
  department: string;
  totalWorkTime: number;
  totalBreakTime: number;
  overtimeMinutes: number;
  projects: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  error?: string;
}
