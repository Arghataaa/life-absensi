import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise"; 
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: any;

export function getDb() {
  if (!instance) {
    const connectionPool = mysql.createPool(env.databaseUrl);
    
    // Kita panggil drizzle dengan menyertakan konfigurasi mode kosong atau default mysql
    instance = drizzle(connectionPool, {
      schema: fullSchema,
      mode: "default" as any // 👈 PAKSA MODE DEFAULT: Biar tipe data PlanetScale lama di project abang ter-override sempurna!
    });
  }
  return instance;
}