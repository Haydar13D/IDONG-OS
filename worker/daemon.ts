import fs from "fs";
import path from "path";
import https from "https";
import { PrismaClient, ContractStatus } from "@prisma/client";

// 1. Lightweight self-contained .env loader to support independent runtime executions
function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(envPath)) {
    console.log(`[Env Loader] Warning: .env file not found at ${envPath}`);
    return;
  }
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    const key = parts[0]?.trim();
    let val = parts.slice(1).join("=").trim();
    if (key && val) {
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  });
}

loadEnv();

const prisma = new PrismaClient();

// Telegram Bot details
const token = process.env.TELEGRAM_BOT_TOKEN || "your_bot_token";
const chatId = process.env.TELEGRAM_CHAT_ID || "your_chat_id";

/**
 * Sends a Markdown-formatted message to the Telegram Bot endpoint.
 */
export function sendTelegramMessage(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!token || !chatId || token === "your_bot_token" || chatId === "your_chat_id") {
      console.log("[MOCK TELEGRAM ALERT]\n", text);
      resolve(true);
      return;
    }

    const payload = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
    });

    const options = {
      hostname: "api.telegram.org",
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          console.error("Telegram API Error:", res.statusCode, data);
          resolve(false);
        }
      });
    });

    req.on("error", (err) => {
      console.error("Telegram Connection Error:", err);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Converts a standard Date object into local GMT+7 Date parameters.
 */
function getGMT7Time(date: Date = new Date()) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const gmt7 = new Date(utc + 3600000 * 7);
  return {
    hours: gmt7.getHours(),
    minutes: gmt7.getMinutes(),
    day: gmt7.getDay(), // 0 = Sunday, 1 = Monday
    dateString: gmt7.toISOString().split("T")[0],
    rawDate: gmt7,
  };
}

// Memory logs to avoid double alerts in the same minute
let lastSentDailyReminder: string | null = null;
let lastSentRedFlagWarning: string | null = null;
let lastSentWeeklySummary: string | null = null;

/**
 * Main checking logic evaluated every minute.
 */
export async function checkSchedules() {
  const time = getGMT7Time();
  const todayStr = time.dateString;

  // Retrieve app configs from DB
  let config = await prisma.companyConfig.findUnique({ where: { id: 1 } });
  if (!config) {
    config = await prisma.companyConfig.create({
      data: {
        id: 1,
        companyName: "IDONG OS",
        currentStreak: 0,
        longestStreak: 0,
        redFlagStatus: false,
      },
    });
  }

  const [dailyH, dailyM] = config.dailyReminder.split(":").map(Number);
  const [weeklyH, weeklyM] = config.weeklyReminder.split(":").map(Number);

  // Check today's DailyLog submission status
  const todayStart = new Date(time.rawDate);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(time.rawDate);
  todayEnd.setHours(23, 59, 59, 999);

  // Retrieve log relative to GMT+7 bounds
  const todayLog = await prisma.dailyLog.findFirst({
    where: {
      loggedAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  const standupPending = !todayLog;

  // 1. Daily Standup Reminder Alert
  if (
    time.hours === dailyH &&
    time.minutes === dailyM &&
    lastSentDailyReminder !== todayStr
  ) {
    if (standupPending) {
      const msg = `🔔 *IDONG OS Daily Reminder* \n\nAnda belum mengisi log standup hari ini! Isi segera sebelum hari berakhir untuk mempertahankan streak aktif Anda (Streak aktif saat ini: ${config.currentStreak} hari).`;
      await sendTelegramMessage(msg);
    }
    lastSentDailyReminder = todayStr;
  }

  // 2. Daily Red Flag Warning Alert (Triggered at 23:00 local time)
  if (
    time.hours === 23 &&
    time.minutes === 0 &&
    lastSentRedFlagWarning !== todayStr
  ) {
    if (standupPending) {
      const msg = `⚠️ *WARNING: Red Flag Alert!* \n\nHari ini akan segera berakhir dalam 1 jam dan Anda belum mengisi log standup. Jika tidak diisi sebelum 23:59:59, streak harian Anda akan di-reset ke 0!`;
      await sendTelegramMessage(msg);
    }
    lastSentRedFlagWarning = todayStr;
  }

  // 3. Weekly Summary Alert (Triggered on Sunday at weeklyReminder hour)
  if (
    time.day === 0 && // Sunday
    time.hours === weeklyH &&
    time.minutes === weeklyM &&
    lastSentWeeklySummary !== todayStr
  ) {
    // Find active weekly contract
    const weekNumber = Math.ceil((((time.rawDate.getTime() - new Date(Date.UTC(time.rawDate.getFullYear(), 0, 1)).getTime()) / 86400000) + 1) / 7);
    const activeContract = await prisma.weeklyContract.findFirst({
      where: {
        weekNumber,
        year: time.rawDate.getFullYear(),
      },
      include: {
        commitments: {
          include: {
            task: true,
          },
        },
      },
    });

    if (activeContract) {
      const commLines = activeContract.commitments
        .map((c, i) => `${i + 1}. [${c.task.status === "DONE" ? "✓" : "✕"}] ${c.task.title}`)
        .join("\n");

      const msg = `📊 *Laporan Mingguan IDONG OS (Minggu ${activeContract.weekNumber})* \n\n*Target Komitmen Mingguan:*\n${commLines}\n\n*Status:* ${
        activeContract.status === ContractStatus.COMPLETED ? "LULUS 🎉" : activeContract.status === ContractStatus.FAILED ? "GAGAL ❌" : "AKTIF"
      }\n*Skor Pencapaian:* ${Math.round(activeContract.score * 100)}%\n*Streak Harian Aktif:* ${config.currentStreak} Hari.`;
      
      await sendTelegramMessage(msg);
    } else {
      const msg = `📊 *Laporan Mingguan IDONG OS* \n\nTidak ditemukan kontrak mingguan aktif yang berjalan untuk Minggu ${weekNumber}, Tahun ${time.rawDate.getFullYear()}.`;
      await sendTelegramMessage(msg);
    }
    lastSentWeeklySummary = todayStr;
  }
}

/**
 * Bootstraps the background interval worker daemon process.
 */
function start() {
  console.log("--------------------------------------------------");
  console.log("IDONG OS Telegram Bot Daemon Worker started.");
  console.log(`Telegram Bot Token configured: ${token !== "your_bot_token"}`);
  console.log(`Telegram Chat ID configured: ${chatId !== "your_chat_id"}`);
  console.log("--------------------------------------------------");

  // Run initial check on boot
  checkSchedules().catch(console.error);

  // Check schedules every 60 seconds
  setInterval(() => {
    checkSchedules().catch(console.error);
  }, 60000);
}

// Only start when executed directly (npx ts-node worker/daemon.ts)
if (require.main === module) {
  start();
}
