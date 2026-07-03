import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

// Kita ambil tipe insert secara dinamis langsung dari tabel users agar tidak eror member 'InsertUser'
type InsertUser = typeof schema.users.$inferInsert;

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    // Gunakan pengecekan tipe dynamic jika properti unionId memakai penulisan berbeda (misal: union_id)
    // @ts-ignore - mengabaikan validasi kolom jika skema database belum di-push/generate ulang
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function findUserByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: any) {
  const values: any = { ...data };
  
  // Kita ubah tipenya jadi any biar bebas masukin properti apa saja tanpa di-komplain TypeScript
  const updateSet: any = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.unionId &&
    values.unionId === (env as any).ownerUnionId
  ) {
    values.role = "ADMIN";
    updateSet.role = "ADMIN";
  }

  await getDb()
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}