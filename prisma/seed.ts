import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Seed CompanyConfig (Singleton with ID 1)
  const config = await prisma.companyConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: "IDONG OS",
      currentStreak: 0,
      longestStreak: 0,
      redFlagStatus: false,
    },
  });
  console.log("Seeded CompanyConfig:", config);

  // 2. Seed Divisions
  const divisionsData = [
    { name: "Skripsi & Riset", slug: "skripsi" as const },
    { name: "Job Readiness", slug: "job" as const },
    { name: "Skill Building", slug: "skill" as const },
    { name: "Organisasi & Personal", slug: "personal" as const },
  ];

  for (const div of divisionsData) {
    const division = await prisma.division.upsert({
      where: { slug: div.slug },
      update: { name: div.name },
      create: {
        name: div.name,
        slug: div.slug,
      },
    });
    console.log(`Seeded Division [${div.slug}]:`, division.name);
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
