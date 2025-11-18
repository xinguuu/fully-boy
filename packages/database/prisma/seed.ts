import { PrismaClient, GameType, Category } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@xingu.com' },
    update: {},
    create: {
      email: 'admin@xingu.com',
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  const oxQuizTemplate = await prisma.game.create({
    data: {
      title: 'OX Quiz - General Knowledge',
      description: 'Test your general knowledge with O/X questions',
      thumbnail: null,
      gameType: GameType.OX_QUIZ,
      category: Category.QUIZ,
      isPublic: true,
      duration: 10,
      minPlayers: 5,
      maxPlayers: 100,
      needsMobile: true,
      settings: {
        timeLimit: 30,
        pointsPerCorrect: 100,
        timeBonusEnabled: true,
        soundEnabled: true,
      },
      questions: {
        create: [
          {
            order: 1,
            content: 'The Earth is flat.',
            data: {
              type: 'true-false',
              options: ['O', 'X'],
              correctAnswer: 'X',
              explanation: 'The Earth is an oblate spheroid (round).',
              duration: 30,
            },
          },
          {
            order: 2,
            content: 'Water boils at 100°C at sea level.',
            data: {
              type: 'true-false',
              options: ['O', 'X'],
              correctAnswer: 'O',
              explanation: 'Water boils at 100°C (212°F) at standard atmospheric pressure.',
              duration: 30,
            },
          },
          {
            order: 3,
            content: 'The Great Wall of China is visible from space.',
            data: {
              type: 'true-false',
              options: ['O', 'X'],
              correctAnswer: 'X',
              explanation: 'This is a common myth. The Great Wall is not visible from space.',
              duration: 30,
            },
          },
          {
            order: 4,
            content: 'Humans have 206 bones in their body.',
            data: {
              type: 'true-false',
              options: ['O', 'X'],
              correctAnswer: 'O',
              explanation: 'An adult human skeleton has 206 bones.',
              duration: 30,
            },
          },
          {
            order: 5,
            content: 'Lightning never strikes the same place twice.',
            data: {
              type: 'true-false',
              options: ['O', 'X'],
              correctAnswer: 'X',
              explanation:
                'Lightning can and does strike the same place multiple times, especially tall buildings.',
              duration: 30,
            },
          },
        ],
      },
    },
  });

  console.log('✅ Created OX Quiz template:', oxQuizTemplate.title);

  const koreanCultureQuiz = await prisma.game.create({
    data: {
      title: 'OX Quiz - Korean Culture',
      description: 'How much do you know about Korean culture?',
      thumbnail: null,
      gameType: GameType.OX_QUIZ,
      category: Category.ICE_BREAKING,
      isPublic: true,
      duration: 10,
      minPlayers: 5,
      maxPlayers: 50,
      needsMobile: true,
      settings: {
        timeLimit: 20,
        pointsPerCorrect: 100,
        timeBonusEnabled: false,
        soundEnabled: true,
      },
      questions: {
        create: [
          {
            order: 1,
            content: 'Kimchi is a traditional Korean side dish made from fermented vegetables.',
            data: {
              type: 'true-false',
              options: ['O', 'X'],
              correctAnswer: 'O',
              explanation: 'Kimchi is indeed a fermented vegetable dish, usually made with cabbage.',
              duration: 20,
            },
          },
          {
            order: 2,
            content: 'Taekwondo originated in Japan.',
            data: {
              type: 'true-false',
              options: ['O', 'X'],
              correctAnswer: 'X',
              explanation: 'Taekwondo is a Korean martial art.',
              duration: 20,
            },
          },
          {
            order: 3,
            content: 'BTS is a K-pop group.',
            data: {
              type: 'true-false',
              options: ['O', 'X'],
              correctAnswer: 'O',
              explanation: 'BTS is one of the most famous K-pop groups in the world.',
              duration: 20,
            },
          },
        ],
      },
    },
  });

  console.log('✅ Created Korean Culture quiz template:', koreanCultureQuiz.title);

  const companyQuiz = await prisma.game.create({
    data: {
      title: 'OX Quiz - Company Trivia (Template)',
      description: 'Customize this with your company facts!',
      thumbnail: null,
      gameType: GameType.OX_QUIZ,
      category: Category.ICE_BREAKING,
      isPublic: true,
      duration: 10,
      minPlayers: 10,
      maxPlayers: 100,
      needsMobile: true,
      settings: {
        timeLimit: 30,
        pointsPerCorrect: 100,
        timeBonusEnabled: true,
        soundEnabled: true,
      },
      questions: {
        create: [
          {
            order: 1,
            content: 'Our company was founded in 2020. (Edit this question)',
            data: {
              type: 'true-false',
              options: ['O', 'X'],
              correctAnswer: 'O',
              explanation: 'Edit this with your company founding date.',
              duration: 30,
            },
          },
          {
            order: 2,
            content: 'Our office has a rooftop garden. (Edit this question)',
            data: {
              type: 'true-false',
              options: ['O', 'X'],
              correctAnswer: 'X',
              explanation: 'Edit this with facts about your office.',
              duration: 30,
            },
          },
          {
            order: 3,
            content: 'We have more than 50 employees. (Edit this question)',
            data: {
              type: 'true-false',
              options: ['O', 'X'],
              correctAnswer: 'O',
              explanation: 'Edit this with your company employee count.',
              duration: 30,
            },
          },
        ],
      },
    },
  });

  console.log('✅ Created Company Trivia template:', companyQuiz.title);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
