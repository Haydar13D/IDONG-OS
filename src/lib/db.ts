import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// Enable Write-Ahead Logging (WAL) mode for SQLite to allow concurrent reads/writes
// and prevent SQLITE_BUSY locking errors between the Next.js app and Worker daemon.
if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development") {
  prisma.$queryRawUnsafe(`PRAGMA journal_mode=WAL;`).catch((err) => {
    console.error("Failed to enable WAL mode for SQLite:", err);
  });
}

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
