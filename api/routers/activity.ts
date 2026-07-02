import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { activityLogs, users } from "@db/schema";
import { eq, desc, sql, gte, and } from "drizzle-orm";

export const activityRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        type: z.enum(["LOGIN", "ATTENDANCE", "CRUD", "DEVICE", "SYSTEM"]).optional(),
        startDate: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(25),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 25;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (input?.type) conditions.push(eq(activityLogs.type, input.type));
      if (input?.startDate) conditions.push(gte(activityLogs.createdAt, new Date(input.startDate)));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const data = await db.select({
        id: activityLogs.id,
        type: activityLogs.type,
        action: activityLogs.action,
        detail: activityLogs.detail,
        ipAddress: activityLogs.ipAddress,
        createdAt: activityLogs.createdAt,
        userName: users.name,
      })
        .from(activityLogs)
        .leftJoin(users, eq(activityLogs.userId, users.id))
        .where(whereClause)
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(activityLogs)
        .where(whereClause);

      return {
        data,
        pagination: { page, limit, total: countResult[0]?.count ?? 0, totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit) },
      };
    }),

  create: publicQuery
    .input(
      z.object({
        userId: z.number().optional(),
        type: z.enum(["LOGIN", "ATTENDANCE", "CRUD", "DEVICE", "SYSTEM"]),
        action: z.string(),
        detail: z.string().optional(),
        ipAddress: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(activityLogs).values({
        userId: input.userId,
        type: input.type,
        action: input.action,
        detail: input.detail,
        ipAddress: input.ipAddress,
      });
      return { success: true };
    }),
});
