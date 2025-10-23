export type ResponseModel<T> = {
  Data: T[];
};
export type SingleItemResponseModel<T> = {
  Data: T;
  StatusCode: number;
  Msg: string;
};
export type Avatars_File = {
  Avatar: string | null;
  Avatar2: string | null;
  FileName: string | null;
  FileUrl: string | null;
  UserId: string | null;
};
export type ListResponseModel<T> = {
  Data: ResponseModel<T>;
};
export type ClientStaffStatusModel = {
  Icon: string | null;
  WorkStatusName: string | null;
  JobTitleId: string | null;
  ScopeType: number | null;
  BusinessClientId: string | null;
  IsWorkingOutStatus: boolean | null;
  IsIdleStatus: boolean | null;
  Color: string | null;
  IsAbsent: boolean | null;
  DefaultMaxTime: number | null;
  IsPaid: boolean | null;
  IsHalfDayOff: boolean | null;
  IsNormalDayOff: boolean | null;
  IsLoginStatus: boolean | null;
  IsInactive: boolean | null;
  IsLogoutStatus: boolean | null;
  IsWorkingInStatus: boolean | null;
  BackgroundColor: string | null;
  Code: string | null;
  Id: string | null;
  Key: string | null;
};

export type ClientStaffTimeTrackingModel = {
  //ClientStaffTimeTrackingModel
  Id: string | null;
  StaffId: string | null;
  TimeStart: number | null;
  TimeEnd: number | null;
  DurationSeconds: number | null;
  DurationFormatted: string | null;
  StatusDefinitionId: string | null;
  StatusName: string | null;
  DefaultMaxTime: number | null;
  Note: string | null;
};
export type FileForm = {
  file: BinaryType[];
};
export type UserProfile = {
  Address: string | null;
  DateOfBirth: number | null;
  DisplayName: string | null;
  EmailAddress: string | null;
  FirstName: string | null;
  LanguageCode: string | null;
  LastName: string | null;
  MiddleName: string | null;
  MobilePhone: string | null;
  Note: string | null;
  PhoneNumber: string | null;
  ProfilePicturePath: string | null;
  StaffStatusIdID: string | null;
  Username: string | null;
};
