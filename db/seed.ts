import { getDb } from "../api/queries/connection";
import { users, employees, attendance, devices, settings, activityLogs } from "./schema";
import { hashSync } from "bcryptjs";

const db = getDb();

async function seed() {
  console.log("Seeding database cloud...");

  // ── 1. Settings (Konfigurasi Wajib) ───────────────────────────
  await db.insert(settings).values({
    key: "system_config", 
    value: "active",       
    companyName: "LifeMedia",
    timezone: "Asia/Jakarta",
    workStartTime: "08:00",
    workEndTime: "17:00",
    lateTolerance: 15,
    workDays: "1,2,3,4,5",
  });
  console.log("Settings seeded");

  // ── 2. Admin Akun Utama ─────────────────────────────────────────
  const adminPassword = hashSync("admin123", 10);
  await db.insert(users).values({
    username: "admin_lifemedia", 
    email: "admin@lifemedia.id",
    name: "Admin LifeMedia",
    password: adminPassword,
    role: "ADMIN",
    isActive: true,
  });
  console.log("Admin seeded");

  // ── 3. HR Akun Utama ───────────────────────────────────────────
  const hrPassword = hashSync("hr123", 10);
  await db.insert(users).values({
    username: "citra_hr", 
    email: "hr@lifemedia.id",
    name: "Citra Lestari",
    password: hrPassword,
    role: "HR",
    isActive: true,
  });
  console.log("HR seeded");

  // ── 4. Devices & Logs (Biar Sistem Gak Crash) ──────────────────
  await db.insert(devices).values({
    deviceId: "JETSON-OFFICE-01",
    name: "Jetson Nano - Kantor Pusat",
    location: "Kantor Pusat - Lantai 1",
    ipAddress: "192.168.1.101",
    status: "ONLINE",
  });

  await db.insert(activityLogs).values({
    userId: 1,
    type: "SYSTEM",
    action: "Sistem dimulai",
    detail: "LifeAbsensi v1.0.0 started via Cloud",
    ipAddress: "127.0.0.1",
  });

  console.log("Seeding selesai! Database cloud bersih siap digunakan.");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});