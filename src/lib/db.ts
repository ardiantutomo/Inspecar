import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

// `file:./data/dev.db` harus menunjuk file yang sama baik dari Prisma CLI
// (relatif ke prisma.config.ts) maupun dari runtime app (relatif ke cwd).
function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL || "file:./data/dev.db";
  if (!raw.startsWith("file:")) return raw;
  const filePath = raw.slice("file:".length);
  if (path.isAbsolute(filePath)) return raw;
  return `file:${path.resolve(/*turbopackIgnore: true*/ process.cwd(), filePath)}`;
}

function createClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: resolveDatabaseUrl() });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
