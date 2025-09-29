export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  APP_NAME: import.meta.env.VITE_APP_NAME as string,
  ENABLE_MSW: String(import.meta.env.VITE_ENABLE_MSW || "").toLowerCase() === "true",
};
