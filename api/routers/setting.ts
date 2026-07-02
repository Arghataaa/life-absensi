import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { settings } from "@db/schema";
import { eq } from "drizzle-orm";

export const settingRouter = createRouter({
  get: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select().from(settings).limit(1);
    return result[0] ?? null;
  }),

  update: publicQuery
    .input(z.any())
    .mutation(async ({ input }) => {
      const db = getDb();
      
      // 1. Jinakkan jam biar pasti punya detik (08:00 -> 08:00:00)
      let wStart = String(input.workStartTime || input.work_start_time || "08:00").replace(".", ":");
      if (wStart.length === 5) wStart += ":00"; 

      let wEnd = String(input.workEndTime || input.work_end_time || "16:00").replace(".", ":");
      if (wEnd.length === 5) wEnd += ":00"; 

      // 2. Siapkan data lengkap (TERMASUK kolom 'key' dan 'value' biar MySQL Aiven gak ngamuk!)
      const dataPayload = {
        key: "system_config", // 🔥 KITA ISI BIAR GAK EROR
        value: "active",      // 🔥 KITA ISI BIAR GAK EROR
        companyName: String(input.companyName || input.company_name || "LifeMedia"),
        timezone: String(input.timezone || "Asia/Jakarta"),
        workDays: String(input.workDays || input.work_days || "1,2,3,4,5,6"),
        workStartTime: wStart,
        workEndTime: wEnd,
        lateTolerance: Number(input.lateTolerance ?? input.late_tolerance ?? 15)
      };

      // 3. Eksekusi dengan aman lewat ORM
      const existing = await db.select().from(settings).limit(1);

      if (existing.length === 0) {
        await db.insert(settings).values(dataPayload as any);
      } else {
        await db.update(settings).set(dataPayload as any).where(eq(settings.id, existing[0].id));
      }

      return { success: true };
    }),
});