import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';
const prisma = new PrismaClient();

const PASSWORD = 'password';

async function main() {
  const hash = hashSync(PASSWORD, 12);
  const usernames = ['user1', 'user2', 'user3'];
  await Promise.all(
    usernames.map(async (name) =>
      prisma.user.upsert({
        where: {
          name,
        },
        update: {
          password: hash,
        },
        create: {
          name,
          password: hash,
        },
      })
    )
  );
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
