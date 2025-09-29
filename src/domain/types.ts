export type Department = { id: string; name: string };
export type Project = { id: string; name: string };
export type Staff = {
  id: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  projectIds: string[];
  email?: string;
  avatarUrl?: string;
  isActive: boolean;
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

export const STATUS_LABELS: Record<StatusKey, string> = {
  login: "Login",
  logout: "Logout",
  morning_break: "Morning Break",
  lunch_break: "Lunch Break",
  afternoon_break: "Afternoon Break",
  restroom: "Restroom",
  work_in_ez_project: "Work In Ez project",
  work_out_ez_project: "Work Out Ez project",
  it_on_floor: "IT - On floor",
  it_project: "IT - Project",
  it_management: "IT - Management",
  in_meeting: "In Meeting",
  staff_meeting: "Staff Meeting",
  in_training: "In Training",
  the_juice: "The Juice",
  birthday_greeting: "Birthday Greeting",
  code_review: "Code Review",
};
