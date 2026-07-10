-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CompanyConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "companyName" TEXT NOT NULL DEFAULT 'IDONG OS',
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "redFlagStatus" BOOLEAN NOT NULL DEFAULT false,
    "lastStreakReset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "timezone" TEXT NOT NULL DEFAULT 'GMT+7',
    "dailyReminder" TEXT NOT NULL DEFAULT '08:00',
    "weeklyReminder" TEXT NOT NULL DEFAULT '08:00',
    "dashboardLayout" TEXT NOT NULL DEFAULT '3-column',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CompanyConfig" ("companyName", "createdAt", "currentStreak", "id", "lastStreakReset", "longestStreak", "redFlagStatus", "updatedAt") SELECT "companyName", "createdAt", "currentStreak", "id", "lastStreakReset", "longestStreak", "redFlagStatus", "updatedAt" FROM "CompanyConfig";
DROP TABLE "CompanyConfig";
ALTER TABLE "new_CompanyConfig" RENAME TO "CompanyConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
