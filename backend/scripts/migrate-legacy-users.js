/**
 * Script to migrate existing users to legacy status (exempt from subscriptions)
 * 
 * This script marks all existing users as not requiring subscription,
 * allowing them to continue using the platform without payment.
 * 
 * Usage:
 *   node scripts/migrate-legacy-users.js
 * 
 * Options:
 *   --dry-run    Show what would be updated without making changes
 *   --before     Migrate users created before this date (default: now)
 * 
 * Examples:
 *   node scripts/migrate-legacy-users.js --dry-run
 *   node scripts/migrate-legacy-users.js --before="2026-01-31"
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  // Get cutoff date from args or use now
  const beforeArg = args.find(arg => arg.startsWith('--before='));
  const beforeDate = beforeArg 
    ? new Date(beforeArg.split('=')[1]) 
    : new Date();

  console.log('\n🔄 Legacy User Migration Script');
  console.log('================================\n');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes will be made)' : '✏️  LIVE (will update database)'}`);
  console.log(`Cutoff Date: ${beforeDate.toISOString()}\n`);

  // Count users that will be affected
  const usersToMigrate = await prisma.user.findMany({
    where: {
      createdAt: {
        lt: beforeDate
      },
      requiresSubscription: true // Only those who currently require subscription
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      isActive: true,
      subscriptionStatus: true
    }
  });

  if (usersToMigrate.length === 0) {
    console.log('✅ No users to migrate. All existing users are already marked as legacy.\n');
    return;
  }

  console.log(`Found ${usersToMigrate.length} user(s) to migrate:\n`);
  
  // Show details
  usersToMigrate.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email})`);
    console.log(`   Created: ${user.createdAt.toISOString()}`);
    console.log(`   Status: ${user.isActive ? 'Active' : 'Inactive'}`);
    console.log(`   Subscription: ${user.subscriptionStatus || 'None'}\n`);
  });

  if (dryRun) {
    console.log('🔍 DRY RUN: No changes were made.');
    console.log('💡 Run without --dry-run to apply these changes.\n');
    return;
  }

  // Confirm before proceeding
  console.log('⚠️  This will mark these users as legacy (not requiring subscription).');
  console.log('⚠️  They will keep their current active/inactive status.\n');
  
  // In production, you might want to add a confirmation prompt here
  // For now, proceeding automatically in script mode

  // Perform the migration
  const result = await prisma.user.updateMany({
    where: {
      createdAt: {
        lt: beforeDate
      },
      requiresSubscription: true
    },
    data: {
      requiresSubscription: false
    }
  });

  console.log(`✅ Successfully migrated ${result.count} user(s) to legacy status.`);
  console.log('✅ These users can now access the platform without subscription.\n');

  // Show summary
  const summary = await prisma.user.groupBy({
    by: ['requiresSubscription'],
    _count: true
  });

  console.log('📊 User Summary:');
  summary.forEach(group => {
    const label = group.requiresSubscription 
      ? 'Requires Subscription' 
      : 'Legacy/Admin (No Subscription Required)';
    console.log(`   ${label}: ${group._count} users`);
  });
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('\n❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
