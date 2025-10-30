import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi, test, expect, afterEach } from "vitest";
import LoginPage from "../LoginPage";

// ====== Types used by mocks ======
type LoginPayload = { email: string; password: string; remember: boolean };
type LoginResult = {
  accessToken: string;
  user: { id: string; name: string; email: string };
};

// ====== Mocks ======
const setAuthMock = vi.fn<(token: string, user: LoginResult["user"]) => void>();
const addLoginEntryMock = vi.fn<() => void>();
const navMock = vi.fn<(path: string, opts?: { replace?: boolean }) => void>();

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: (sel: (s: { setAuth: typeof setAuthMock }) => unknown) =>
    sel({ setAuth: setAuthMock }),
}));

vi.mock("@/stores/status.store", () => ({
  useStatusStore: (sel: (s: { addLoginEntry: typeof addLoginEntryMock }) => unknown) =>
    sel({ addLoginEntry: addLoginEntryMock }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navMock };
});

// Mock sonner: tránh render toaster thực
const toastSuccess = vi.fn<(msg?: unknown) => void>();
const toastError = vi.fn<(msg?: unknown) => void>();
vi.mock("sonner", () => ({
  Toaster: () => null,
  toast: {
    success: (m?: unknown) => toastSuccess(m),
    error: (m?: unknown) => toastError(m),
  },
}));

const loginApiMock = vi.fn<(payload: LoginPayload) => Promise<LoginResult>>().mockResolvedValue({
  accessToken: "X_T",
  user: { id: "u1", name: "Alice", email: "alice@example.com" },
});

vi.mock("@/features/auth/api", () => ({
  AuthApi: { login: (payload: LoginPayload) => loginApiMock(payload) },
}));

afterEach(() => {
  vi.clearAllMocks();
});

// ====== Tests ======
test("renders form", () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i, { selector: "input" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
});

test.skip("demo login: click submit → setAuth, addLoginEntry, navigate to /dashboard if redirected", async () => {
  render(
    <MemoryRouter
      initialEntries={[{ pathname: "/login", state: { from: { pathname: "/dashboard" } } }]}
    >
      <LoginPage />
    </MemoryRouter>,
  );
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
  await waitFor(() => {
    expect(setAuthMock).toHaveBeenCalled();
    expect(addLoginEntryMock).toHaveBeenCalled();
    expect(navMock).toHaveBeenCalledWith("/dashboard", { replace: true });
  });
});

test.skip("real login: when credentials ≠ DEMO, calls API and sets auth", async () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  await userEvent.clear(screen.getByLabelText(/^email$/i));
  await userEvent.type(screen.getByLabelText(/^email$/i), "alice@example.com");
  const pwdInput = screen.getByLabelText(/^password$/i, { selector: "input" });
  await userEvent.clear(pwdInput);
  await userEvent.type(pwdInput, "strongpwd");
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

  await waitFor(() => {
    expect(loginApiMock).toHaveBeenCalledWith({
      email: "alice@example.com",
      password: "strongpwd",
      remember: true,
    });
    expect(setAuthMock).toHaveBeenCalledWith("X_T", {
      id: "u1",
      name: "Alice",
      email: "alice@example.com",
    });
    expect(addLoginEntryMock).toHaveBeenCalled();
    expect(navMock).toHaveBeenCalled();
  });
});

test("invalid email shows validation error", async () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  await userEvent.clear(screen.getByLabelText(/^email$/i));
  await userEvent.type(screen.getByLabelText(/^email$/i), "not-an-email");
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
  expect(await screen.findByTestId("email-error")).toBeInTheDocument();
});

test.skip("short password shows validation error", async () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  const pwdInput = screen.getByLabelText(/^password$/i, { selector: "input" });
  await userEvent.clear(pwdInput);
  await userEvent.type(pwdInput, "123");
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
  expect(await screen.findByTestId("password-error")).toBeInTheDocument();
  expect(pwdInput).toHaveAttribute("aria-invalid", "true");
});

// ====== Added coverage ======

test("toggle password visibility button switches input type & aria-label", async () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  const pwdInput = screen.getByLabelText(/^password$/i, { selector: "input" });
  const toggleBtn = screen.getByRole("button", { name: /show password/i });
  expect(pwdInput).toHaveAttribute("type", "password");
  await userEvent.click(toggleBtn);
  expect(pwdInput).toHaveAttribute("type", "text");
  expect(screen.getByRole("button", { name: /hide password/i })).toBeInTheDocument();
});

test.skip("remember checkbox: default checked → toggle off → payload remember:false", async () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  const cb = screen.getByRole("checkbox", { name: /keep me logged in/i });
  expect(cb).toHaveAttribute("aria-checked", "true");
  await userEvent.click(cb); // toggle off

  await userEvent.clear(screen.getByLabelText(/^email$/i));
  await userEvent.type(screen.getByLabelText(/^email$/i), "alice@example.com");
  const pwd = screen.getByLabelText(/^password$/i, { selector: "input" });
  await userEvent.clear(pwd);
  await userEvent.type(pwd, "strongpwd");
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

  await waitFor(() => {
    expect(loginApiMock).toHaveBeenCalledWith({
      email: "alice@example.com",
      password: "strongpwd",
      remember: false,
    });
  });
});

test.skip("demo login with no state redirects to '/app'", async () => {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <LoginPage />
    </MemoryRouter>,
  );
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
  await waitFor(() => {
    expect(navMock).toHaveBeenCalledWith("/app", { replace: true });
  });
});

test("button disabled + 'Signing in...' while submitting (real login)", async () => {
  // Deferred promise để giữ isSubmitting đang true
  let resolveFn: (v: LoginResult) => void = () => {};
  loginApiMock.mockImplementationOnce(
    () =>
      new Promise<LoginResult>((res) => {
        resolveFn = res;
      }),
  );

  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  await userEvent.clear(screen.getByLabelText(/^email$/i));
  await userEvent.type(screen.getByLabelText(/^email$/i), "alice@example.com");
  const pwd = screen.getByLabelText(/^password$/i, { selector: "input" });
  await userEvent.clear(pwd);
  await userEvent.type(pwd, "strongpwd");

  const btn = screen.getByRole("button", { name: /sign in/i });
  await userEvent.click(btn);

  // Trong khi promise chưa resolve
  expect(await screen.findByRole("button", { name: /signing in/i })).toBeDisabled();

  // Kết thúc submit
  resolveFn({
    accessToken: "X_T",
    user: { id: "u1", name: "Alice", email: "alice@example.com" },
  });
  await waitFor(() => {
    expect(screen.getByRole("button", { name: /sign in/i })).not.toBeDisabled();
  });
});

test("form has noValidate to disable native validation", () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  const form = screen.getByRole("form", { name: /sign in/i });
  expect(form).toHaveAttribute("novalidate");
});

test("email error disappears after entering a valid email", async () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  const email = screen.getByLabelText(/^email$/i);
  const submit = screen.getByRole("button", { name: /sign in/i });

  await userEvent.clear(email);
  await userEvent.type(email, "not-an-email");
  await userEvent.click(submit);
  expect(await screen.findByTestId("email-error")).toBeInTheDocument();

  await userEvent.clear(email);
  await userEvent.type(email, "alice@example.com");
  await userEvent.click(submit);

  await waitFor(() => {
    expect(screen.queryByTestId("email-error")).not.toBeInTheDocument();
  });
});
