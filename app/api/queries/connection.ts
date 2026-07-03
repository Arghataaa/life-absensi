import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: any;

export function getDb() {
  if (!instance) {
    // Parse DATABASE_URL manual, karena mysql2 tidak mengenali parameter
    // "ssl-mode" di connection string (itu format khusus MySQL CLI/PlanetScale,
    // bukan format yang dipahami driver mysql2 Node.js).
    const url = new URL(env.databaseUrl);

    const connectionPool = mysql.createPool({
      host: url.hostname,
      port: Number(url.port),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      ssl: {
        // Aiven mewajibkan koneksi SSL. rejectUnauthorized: false dipakai
        // agar tidak perlu download & mount CA cert Aiven secara manual.
        // Ini tetap encrypted-in-transit, hanya tidak verifikasi CA chain.
        rejectUnauthorized: false,
      },
    });

    instance = drizzle(connectionPool, {
      schema: fullSchema,
      mode: "default" as any,
    });
  }
  return instance;
}