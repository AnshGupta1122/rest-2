const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.settings.upsert({
    where: { key: 'upi_id' },
    update: { value: 'anshg8831-1@oksbi' },
    create: { key: 'upi_id', value: 'anshg8831-1@oksbi' },
  });
  
  await prisma.settings.upsert({
    where: { key: 'upi_qr_data' },
    update: { value: 'upi://pay?pa=anshg8831-1@oksbi&pn=Ansh gupta' },
    create: { key: 'upi_qr_data', value: 'upi://pay?pa=anshg8831-1@oksbi&pn=Ansh gupta' },
  });
  
  console.log('UPI settings updated successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
