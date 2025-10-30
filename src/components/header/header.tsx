// function ProfileForm({ onClose }: { onClose: () => void }) {
//   const { setAuth } = useAuthStore();
//   const { token } = useAuthStore();
//   let { user } = useAuthStore();
//   // tách tên hiện có -> first/last (best-effort)
//   const [firstName, setFirstName] = useState(() => {
//     const parts = (user?.name || "").split(" ");
//     return parts[0];
//   });
//   const [lastName, setLastName] = useState(() => {
//     const parts = (user?.name || "").split(" ");
//     return parts[1];
//   });
//   const email = user?.user_name || "";
//   const [mobile, setMobile] = useState(()=>
//     {
//       return user?.user_mobile;
//     }
//   );

//   // avatar preview (ưu tiên localStorage để thấy ngay sau khi upload)
//   // const [avatarPreview, setAvatarPreview] = useState<string | null>(
//   //   typeof window !== "undefined" ? localStorage.getItem("avatarUrl") : null,
//   // );
//   const fileInputId = "profile-avatar-file";

//   const onPickAvatar = (file?: File) => {
//     if (!file) return;
//     const url = URL.createObjectURL(file);
//     console.log(url);
//     document.getElementById("avatar_preview")?.setAttribute("src", url.toString());
//   };

//   const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
//     // Upload avatar if a file is selected
//     api
//       .post<SingleItemResponseModel<UserProfile>>("/api/v1/Account/UpdateFields", {
//         Id: user?.user_id,
//         Values: [
//           { FieldName: "LastName", NewValue: lastName },
//           { FieldName: "FirstName", NewValue: firstName },
//           { FieldName: "PhoneNumber", NewValue: mobile },
//           { FieldName: "DisplayName", NewValue: firstName + " " + lastName },
//         ],
//       })
//       .then((res) => {
//         const fileInput = document.getElementById(fileInputId) as HTMLInputElement | null;
//         const file = fileInput?.files?.[0];
//         if (file) {
//           const formData = new FormData();
//           formData.append("file", file);
//           api
//             .postFormFormData<SingleItemResponseModel<Avatars_File>>(
//               "/api/v1/Upload/User/MyAvatar",
//               formData,
//             )
//             .then((res) => {
//               if (res.StatusCode === 200 || res.StatusCode === 1) {
//                 // Save avatarUrl to localStorage for preview
//                 // if (res.Data) {
//                 //   localStorage.setItem("avatarUrl", res.Data.Avatar??"");
//                 // }
//                 const _user = JSON.parse(localStorage.getItem("auth_response") ?? "");

//                 if (res.StatusCode == 1 || res.StatusCode == 200) {
//                   toast.success("Profile updated");
//                   _user.avatar_url = res.Data.Avatar;
//                 _user.name = firstName + " " + lastName;
//                 _user.user_mobile = mobile;
//                 localStorage.setItem("auth_response", JSON.stringify(_user));
//                 setAuth(token ?? "", displayName || user?.name || "", email || "", user);
//                   onClose();
//                 } else {
//                   toast.error(res.Msg);
//                 }
//               } else {
//                 toast.error(res.Msg || "Failed to upload avatar");
//               }
//             })
//             .catch(() => {
//               toast.error("Error uploading avatar");
//             });
//         } else {

//         if (res.StatusCode == 1 || res.StatusCode == 200) {
//           const _user = JSON.parse(localStorage.getItem("auth_response") ?? "");
//           _user.name = firstName + " " + lastName;
//           _user.user_mobile = mobile;
//           localStorage.setItem("auth_response", JSON.stringify(_user));
//           user = _user;
//           setAuth(token ?? "", displayName || user?.name || "", email || "", user);
//           toast.success("Profile updated");
//           onClose();
//         } else {
//           toast.error(res.Msg);
//         }
//         }

//       })
//       .catch((e) => {
//         toast.error(e);
//       });
//   };

//   return (
//     <form onSubmit={onSubmit} noValidate>
//       {/* GRID: Avatar trái (260px) | Panel phải (form + divider) */}
//       <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] gap-6">
//         {/* LEFT: avatar tròn + nút máy ảnh đè góc */}
//         <div className="h-full flex items-center justify-center">
//           <div className="relative w-28 h-28">
//             <Avatar className="h-28 w-28 ring-2 ring-white shadow">
//               <AvatarImage
//                 id="avatar_preview"
//                 src={user?.avatar_url??""}
//                 alt={user?.name || email || "avatar"}
//               />
//               <AvatarFallback className="bg-primary/10 text-primary text-xl">
//                 {(user?.name || email || "U")
//                   .split(" ")
//                   .map((n) => n[0])
//                   .join("")
//                   .toUpperCase()}
//               </AvatarFallback>
//             </Avatar>

//             {/* camera overlay */}
//             <button
//               type="button"
//               onClick={() =>
//                 (document.getElementById(fileInputId) as HTMLInputElement | null)?.click()
//               }
//               className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full ring-2 ring-white border dark:border-slate-700 bg-white text-slate-700 shadow hover:bg-slate-50"
//               aria-label="Change avatar"
//             >
//               <Camera className="h-4 w-4" />
//             </button>

//             <input
//               id={fileInputId}
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={(e) => onPickAvatar(e.target.files?.[0])}
//             />
//           </div>
//         </div>

//         {/* RIGHT: form + divider full-height bằng border-l */}
//         <div className="md:pl-10 md:border-l md:border-slate-200 dark:md:border-slate-800">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
//             {/* First name */}
//             <div className="space-y-2">
//               <Label htmlFor="firstName">First name</Label>
//               <div className="relative">
//                 <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
//                   <User className="h-4 w-4" />
//                 </span>
//                 <Input
//                   id="firstName"
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                   placeholder="Enter first name"
//                   className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Last name */}
//             <div className="space-y-2">
//               <Label htmlFor="lastName">Last name</Label>
//               <div className="relative">
//                 <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
//                   <User className="h-4 w-4" />
//                 </span>
//                 <Input
//                   id="lastName"
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                   placeholder="Enter last name"
//                   className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Email */}
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <div className="relative">
//                 <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
//                   <Mail className="h-4 w-4" />
//                 </span>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={user?.user_name || email}
//                   readOnly
//                   className="pl-10 h-11 rounded-xl bg-gray-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 cursor-not-allowed"
//                   title="Email cannot be changed"
//                   disabled
//                 />
//               </div>
//             </div>

//             {/* Mobile */}
//             <div className="space-y-2">
//               <Label htmlFor="mobile">Mobile</Label>
//               <div className="relative">
//                 <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
//                   <Phone className="h-4 w-4" />
//                 </span>
//                 <Input
//                   id="mobile"
//                   type="tel"
//                   inputMode="tel"
//                   pattern="[0-9+()\\-\\s]{7,}"
//                   value={mobile}
//                   onChange={(e) => setMobile(e.target.value)}
//                   placeholder="+84 912 345 678"
//                   className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
//                 />
//               </div>
//               <p className="text-xs text-muted-foreground">Format: digits, +, (, ), space or -</p>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* Actions: nhỏ, về bên phải; mobile thì full-width */}
//       <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
//         <Button type="button" variant="ghost" onClick={onClose} className="h-10 sm:w-auto">
//           Cancel
//         </Button>
//         <Button type="submit" className="h-10 px-5 sm:w-auto w-full">
//           Save changes
//         </Button>
//       </div>
//     </form>
//   );
// }
