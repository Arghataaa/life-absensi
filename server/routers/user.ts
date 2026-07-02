import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, karyawan } from "@db/schema"; // 👈 Menggunakan variabel murni 'karyawan'
import { eq, like, or, and, sql } from "drizzle-orm";
import { hashSync } from "bcryptjs";

export const userRouter = createRouter({
  // Sisa prosedur lain (seperti list/get) biarkan tetap ada di bawah/atasnya, 
  // yang paling penting sesuaikan bagian registrasi/add user seperti ini:
  
  registerKaryawanDanUser: publicQuery
    .input(
      z.object({
        username: z.string(), // 👈 Pastikan input username ada
        password: z.string(),
        name: z.string(),
        email: z.string(),
        nip: z.string(),
        namaLengkap: z.string(),
        divisi: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      // 1. Insert ke tabel users (Sesuai validasi schema yang minta username)
      const [insertedUser] = await db.insert(users).values({
        username: input.username,
        password: hashSync(input.password, 10),
        name: input.name,
        email: input.email,
        role: "EMPLOYEE",
        isActive: true,
      }).execute();

      // 2. Insert ke tabel karyawan (Mengubah format Date menjadi string biar gak eror)
      await db.insert(karyawan).values({
        nip: input.nip,
        namaLengkap: input.namaLengkap,
        divisi: input.divisi,
        joinDate: new Date().toISOString().split('T')[0], // 👈 Mengubah objek Date jadi string 'YYYY-MM-DD'
      }).execute();

      return { success: true };
    }),
});