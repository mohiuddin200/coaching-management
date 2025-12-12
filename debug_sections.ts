import { prisma } from "@/lib/prisma";

async function main() {
  const classes = await prisma.class.findMany({
    include: {
      subjects: {
        include: {
          classSections: true,
        },
      },
    },
  });

  console.log(JSON.stringify(classes, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
