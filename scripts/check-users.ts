import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Search for pieno pizza user
  const users = await db.user.findMany({
    where: {
      OR: [
        { email: { contains: "pieno", mode: "insensitive" } },
        { hostProfile: { businessName: { contains: "pieno", mode: "insensitive" } } },
      ],
    },
    include: {
      hostProfile: true,
      guestProfile: true,
    },
  });
  console.log("Pieno pizza users:", JSON.stringify(users, null, 2));

  // List all users
  const allUsers = await db.user.findMany({
    select: {
      id: true,
      email: true,
      userType: true,
      emailVerified: true,
      status: true,
      hostProfile: { select: { id: true, businessName: true, verified: true } },
      guestProfile: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  console.log("\nAll users:");
  for (const u of allUsers) {
    const emailOk = u.emailVerified ? "YES" : "NO";
    const hostName = u.hostProfile?.businessName ?? "none";
    const guestName = u.guestProfile?.firstName ?? "none";
    console.log(
      `  ${u.email} | type=${u.userType} | emailVerified=${emailOk} | status=${u.status} | host=${hostName} | guest=${guestName}`
    );
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
