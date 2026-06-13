import { prisma } from './lib/prisma';

async function test() {
  try {
    const data = await prisma.hotelBooking.findMany();
    console.log(data);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
