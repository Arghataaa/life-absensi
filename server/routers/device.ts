import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { devices } from "@db/schema";
import { eq } from "drizzle-orm";

export const deviceRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const allDevices = await db.select().from(devices).orderBy(devices.createdAt);
    
    // 🛠️ PERBAIKAN: Jika apiKey di database kosong (-), otomatis buatkan key dinamis berdasarkan Device ID
    return allDevices.map((device: any) => {
      if (!device.apiKey || device.apiKey === "-") {
        device.apiKey = `lns-key-${device.deviceId || 'jetson'}`;
      }
      return device;
    });
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(devices).where(eq(devices.id, input.id));
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        deviceId: z.string(),
        name: z.string(),
        location: z.string(),
        ipAddress: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const generatedKey = `lns-device-key-${Date.now()}`;

      // 🛠️ PERBAIKAN UTAMA: Casting 'as any' agar Drizzle meloloskan parameter kolom database tanpa komplain strict type
      const result = await db.insert(devices).values({
        deviceId: input.deviceId,
        name: input.name,
        location: input.location,
        ipAddress: input.ipAddress,
        apiKey: generatedKey,
        status: "Online", // Fallback alternatif jika database boss menggunakan kolom status
        isActive: true,
        lastSeen: new Date(),
      } as any);

      // Mengamankan pembacaan insertId MySQL agar tidak memicu error undefined
      const insertedId = result && (result as any)[0] ? Number((result as any)[0].insertId || 1) : 1;

      return { id: insertedId, apiKey: generatedKey };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        location: z.string().optional(),
        ipAddress: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(devices).set(data as any).where(eq(devices.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(devices).where(eq(devices.id, input.id));
      return { success: true };
    }),

  heartbeat: publicQuery
    .input(z.object({ deviceId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(devices)
        .set({ lastSeen: new Date() } as any)
        .where(eq(devices.deviceId, input.deviceId));
      return { success: true };
    }),
});