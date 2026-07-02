import { authRouter } from "./auth-router";
import { localAuthRouter } from "./routers/localAuth";
import { userRouter } from "./routers/user";
import { attendanceRouter } from "./routers/attendance";
import { deviceRouter } from "./routers/device";
import { settingRouter } from "./routers/setting";
import { activityRouter } from "./routers/activity";
import { notificationRouter } from "./routers/notification";
import { karyawanRouter } from "./routers/karyawan"; // 👈 1. Kita import router karyawan baru kita di sini
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  user: userRouter,
  attendance: attendanceRouter,
  device: deviceRouter,
  setting: settingRouter,
  activity: activityRouter,
  notification: notificationRouter,
  karyawan: karyawanRouter, // 👈 2. Kita buka gerbangnya di sini agar dibaca oleh website!
});

export type AppRouter = typeof appRouter;