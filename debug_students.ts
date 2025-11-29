import { prisma } from "@/lib/prisma";

async function main() {
  const students = await prisma.student.findMany({
    include: {
      level: true,
      enrollments: {
        include: {
          classSection: true,
        },
      },
    },
  });

  console.log(JSON.stringify(students, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
