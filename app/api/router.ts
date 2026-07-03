import { authRouter } from "./auth-router";
import { localAuthRouter } from "./routers/localAuth";
import { userRouter } from "./routers/user";
import { attendanceRouter } from "./routers/attendance";
import { deviceRouter } from "./routers/device";
import { settingRouter } from "./routers/setting";
import { activityRouter } from "./routers/activity";
import { notificationRouter } from "./routers/notification";
import { karyawanRouter } from "./routers/karyawan"; 
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  user: userRouter,
  attendance: attendanceRouter, // 👈 Router absensi aman terdaftar
  device: deviceRouter,
  setting: settingRouter,
  activity: activityRouter,
  notification: notificationRouter,
  karyawan: karyawanRouter,     // 👈 Router karyawan aman terdaftar
});

export type AppRouter = typeof appRouter;