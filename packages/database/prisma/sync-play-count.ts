import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Syncing playCount for all games...\n');

  // Get all games
  const games = await prisma.game.findMany({
    select: {
      id: true,
      title: true,
      isPublic: true,
      sourceGameId: true,
      playCount: true,
    },
  });

  console.log(`📊 Found ${games.length} games to process\n`);

  let updated = 0;
  let skipped = 0;

  // Map to track template play counts (from copies)
  const templatePlayCounts: Map<string, number> = new Map();

  for (const game of games) {
    // Count actual GameResult records for this game
    const actualPlayCount = await prisma.room.count({
      where: {
        gameId: game.id,
        result: {
          isNot: null,
        },
      },
    });

    // Track plays for source templates
    if (game.sourceGameId && actualPlayCount > 0) {
      const currentCount = templatePlayCounts.get(game.sourceGameId) || 0;
      templatePlayCounts.set(game.sourceGameId, currentCount + actualPlayCount);
    }

    // Update if different
    if (game.playCount !== actualPlayCount) {
      await prisma.game.update({
        where: { id: game.id },
        data: { playCount: actualPlayCount },
      });

      console.log(
        `✅ Updated: "${game.title}" (${game.playCount} → ${actualPlayCount})`
      );
      updated++;
    } else {
      skipped++;
    }
  }

  // Update template play counts (aggregate from all copies)
  console.log('\n📦 Updating template aggregate play counts...\n');

  for (const [templateId, copyPlayCount] of templatePlayCounts) {
    const template = await prisma.game.findUnique({
      where: { id: templateId },
      select: { id: true, title: true, isPublic: true, playCount: true },
    });

    if (template && template.isPublic) {
      // Template's own plays + plays from all copies
      const ownPlays = await prisma.room.count({
        where: {
          gameId: templateId,
          result: { isNot: null },
        },
      });

      const totalPlays = ownPlays + copyPlayCount;

      if (template.playCount !== totalPlays) {
        await prisma.game.update({
          where: { id: templateId },
          data: { playCount: totalPlays },
        });

        console.log(
          `📈 Template updated: "${template.title}" (${template.playCount} → ${totalPlays}) [own: ${ownPlays}, copies: ${copyPlayCount}]`
        );
      }
    }
  }

  console.log('\n🎉 Sync completed!');
  console.log(`   Updated: ${updated} games`);
  console.log(`   Skipped (already correct): ${skipped} games`);
}

main()
  .catch((e) => {
    console.error('❌ Sync failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
