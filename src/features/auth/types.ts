export type User = { id: string; name: string; username: string };
export type LoginResponse = {
  access_token: string | null;
  token_type: string | null;
  expires_in: number | null;
  fa2_token: string | null;
  user_name: string | null;
  name: string | null;
  avatar_url: string | null;
  user_id: string | null;
  user_uniqueid: string | null;
  project_screens: string | null;
  project_screens_inactive: string | null;
  configs: string | null;
  app_menu: string | null;
  appLogo_url: string | null;
  appLogo_background: string | null;
  user_mobile: string | null;
  user_type: string | null;
  fa2_needverify: boolean;
  fa2_needenable: boolean;
  fa2_method: string | null;
  language_code: string | null;
  isNeedChangePassword: boolean;
  mustChangePassword: boolean;
};
export type ForgotPasswordResponse = {
  Email: string | null;
  PasswordRecoveryURL: string | null;
  ExpriedDate: string | null;
};
export type ForgotPasswordRequest = {
  Email: string | null;
};
