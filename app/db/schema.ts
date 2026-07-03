import { mysqlTable, varchar, text, timestamp, boolean, int } from "drizzle-orm/mysql-core";

// ========================================================
// TABEL-TABEL
// ========================================================

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull().default(""), 
  email: varchar("email", { length: 255 }).notNull().default(""), 
  role: varchar("role", { length: 50 }).default("EMPLOYEE"),
  avatar: text("avatar"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"),
  type: varchar("type", { length: 50 }),
  action: text("action").notNull(),
  detail: text("detail"),
  ipAddress: varchar("ip_address", { length: 45 }),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const devices = mysqlTable("devices", {
  id: int("id").primaryKey().autoincrement(), 
  deviceId: varchar("device_id", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 45 }), 
  status: varchar("status", { length: 50 }).default("OFFLINE"),
  lastSeen: timestamp("last_seen"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").primaryKey().autoincrement(), 
  userId: int("user_id"),
  type: varchar("type", { length: 50 }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = mysqlTable("settings", {
  id: int("id").primaryKey().autoincrement(), 
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
  companyName: varchar("company_name", { length: 255 }),
  timezone: varchar("timezone", { length: 100 }),
  workDays: varchar("work_days", { length: 255 }), 
  workStartTime: varchar("work_start_time", { length: 10 }),
  workEndTime: varchar("work_end_time", { length: 10 }),
  lateTolerance: int("late_tolerance").default(15),
});

// TABEL KARYAWAN
export const karyawan = mysqlTable("karyawan_cloud", { 
  id: int("id").primaryKey().autoincrement(),
  nip: varchar("nip", { length: 50 }), 
  namaLengkap: varchar("nama_lengkap", { length: 255 }).notNull(),
  divisi: varchar("divisi", { length: 100 }).notNull(),
  userId: int("user_id").default(0), 
  employeeId: varchar("employee_id", { length: 50 }),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  joinDate: varchar("join_date", { length: 20 }),
  facePhoto: text("face_photo"),
});

export const presensi = mysqlTable("presensi_cloud", { 
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"),
  nama: varchar("nama", { length: 255 }).notNull(),
  tanggal: varchar("tanggal", { length: 10 }).notNull(), 
  status: varchar("status", { length: 10 }).default("H"), 
  jamMasuk: varchar("jam_masuk", { length: 8 }),        
  jamPulang: varchar("jam_pulang", { length: 8 }),      
  shift: varchar("shift", { length: 50 }).default("-"),
  type: varchar("type", { length: 50 }),
  employeeName: varchar("employee_name", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Export tambahan biar tidak error
export const employees = karyawan;
export const attendance = presensi;