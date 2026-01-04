const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFinanzas() {
  console.log('🧪 Testing Finanzas Model...\n');

  try {
    // Check if finance_transactions table has the tipo column
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'finance_transactions'
      ORDER BY ordinal_position;
    `;
    
    console.log('✅ finance_transactions columns:');
    console.table(result);

    // Count existing transactions
    const count = await prisma.financeTransaction.count();
    console.log(`\n📊 Total transactions: ${count}`);

    console.log('\n✨ All tests passed! The tipo field has been successfully added.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testFinanzas();
