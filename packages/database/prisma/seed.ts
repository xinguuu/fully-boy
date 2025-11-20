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

  const kpopSongQuiz = await prisma.game.create({
    data: {
      title: 'K-POP 노래 제목 맞추기',
      description: '가사를 보고 노래 제목을 맞춰보세요!',
      thumbnail: null,
      gameType: GameType.FOUR_CHOICE_QUIZ,
      category: Category.MUSIC,
      isPublic: true,
      duration: 15,
      minPlayers: 5,
      maxPlayers: 100,
      needsMobile: true,
      settings: {
        timeLimit: 20,
        pointsPerCorrect: 100,
        timeBonusEnabled: true,
        soundEnabled: true,
      },
      questions: {
        create: [
          {
            order: 1,
            content: '"작은 것들을 위한 시" - 이 노래의 제목은?',
            data: {
              type: 'multiple-choice',
              options: ['Boy With Luv', 'Dynamite', 'Butter', 'Spring Day'],
              correctAnswer: 'Boy With Luv',
              explanation: 'BTS의 "Boy With Luv (작은 것들을 위한 시)"는 2019년 발매되었습니다.',
              duration: 20,
            },
            audioUrl: null,
            imageUrl: null,
            videoUrl: null,
          },
          {
            order: 2,
            content: '"뜨거운 여름밤은 가고 남은 건 볼품없지만" - 이 노래는?',
            data: {
              type: 'multiple-choice',
              options: ['밤편지', '가을 아침', 'Celebrity', '너의 의미'],
              correctAnswer: '가을 아침',
              explanation: 'IU의 "가을 아침"의 유명한 가사입니다.',
              duration: 20,
            },
            audioUrl: null,
            imageUrl: null,
            videoUrl: null,
          },
          {
            order: 3,
            content: '"Kill This Love" - 이 곡을 부른 그룹은?',
            data: {
              type: 'multiple-choice',
              options: ['BLACKPINK', 'TWICE', 'Red Velvet', 'ITZY'],
              correctAnswer: 'BLACKPINK',
              explanation: 'BLACKPINK의 대표곡 "Kill This Love"는 2019년 발매되었습니다.',
              duration: 20,
            },
            audioUrl: null,
            imageUrl: null,
            videoUrl: null,
          },
          {
            order: 4,
            content: '"신호등을 지나 왼쪽으로 돌아" - 이 노래의 제목은?',
            data: {
              type: 'multiple-choice',
              options: ['길', 'TAXI', 'Eight', 'strawberry moon'],
              correctAnswer: 'strawberry moon',
              explanation: 'IU의 "strawberry moon"의 가사입니다.',
              duration: 20,
            },
            audioUrl: null,
            imageUrl: null,
            videoUrl: null,
          },
          {
            order: 5,
            content: '"I am a supa dupa fly" - 이 노래를 부른 가수는?',
            data: {
              type: 'multiple-choice',
              options: ['비', 'PSY', 'Jay Park', 'CL'],
              correctAnswer: 'PSY',
              explanation: 'PSY의 "DADDY"의 유명한 가사입니다.',
              duration: 20,
            },
            audioUrl: null,
            imageUrl: null,
            videoUrl: null,
          },
          {
            order: 6,
            content: '"넌 나의 어둠 속의 한 줄기 빛" - 이 노래는?',
            data: {
              type: 'multiple-choice',
              options: ['사랑에 빠지고 싶다', '한 페이지가 될 수 있게', 'Love poem', '에잇'],
              correctAnswer: 'Love poem',
              explanation: 'IU의 "Love poem"의 감성적인 가사입니다.',
              duration: 20,
            },
            audioUrl: null,
            imageUrl: null,
            videoUrl: null,
          },
          {
            order: 7,
            content: '"강남스타일" - 이 곡을 부른 가수는?',
            data: {
              type: 'multiple-choice',
              options: ['PSY', '빅뱅', '싸이', '박재상'],
              correctAnswer: 'PSY',
              explanation: '2012년 전 세계를 강타한 PSY의 "강남스타일"입니다. (PSY = 싸이 = 박재상)',
              duration: 20,
            },
            audioUrl: null,
            imageUrl: null,
            videoUrl: null,
          },
          {
            order: 8,
            content: '"Dynamite" - 이 곡을 부른 그룹은?',
            data: {
              type: 'multiple-choice',
              options: ['BTS', 'EXO', 'SEVENTEEN', 'Stray Kids'],
              correctAnswer: 'BTS',
              explanation: 'BTS의 첫 빌보드 핫 100 1위 곡 "Dynamite"입니다.',
              duration: 20,
            },
            audioUrl: null,
            imageUrl: null,
            videoUrl: null,
          },
          {
            order: 9,
            content: '"DDU-DU DDU-DU" - 이 곡을 부른 그룹은?',
            data: {
              type: 'multiple-choice',
              options: ['BLACKPINK', '2NE1', 'TWICE', 'Red Velvet'],
              correctAnswer: 'BLACKPINK',
              explanation: 'BLACKPINK의 대표곡 "뚜두뚜두"입니다.',
              duration: 20,
            },
            audioUrl: null,
            imageUrl: null,
            videoUrl: null,
          },
          {
            order: 10,
            content: '"DALLA DALLA" - 이 데뷔곡을 부른 그룹은?',
            data: {
              type: 'multiple-choice',
              options: ['ITZY', 'aespa', 'NewJeans', 'IVE'],
              correctAnswer: 'ITZY',
              explanation: 'ITZY의 2019년 데뷔곡 "달라달라"입니다.',
              duration: 20,
            },
            audioUrl: null,
            imageUrl: null,
            videoUrl: null,
          },
        ],
      },
    },
  });

  console.log('✅ Created K-POP Song Quiz template:', kpopSongQuiz.title);

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
