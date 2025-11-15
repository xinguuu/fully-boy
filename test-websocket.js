// E2E WebSocket Test Client
const io = require('socket.io-client');

const PIN = '540658';
const GAME_ID = 'cmi07uj4v0001btj034wnps7d';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWh4aXIyc3UwMDAwYnQyNGtzaDh0dDloIiwiZW1haWwiOiJ0ZXN0QHhpbmd1LmNvbSIsInJvbGUiOiJPUkdBTklaRVIiLCJpYXQiOjE3NjMyMDY4MzUsImV4cCI6MTc2MzgxMTYzNX0.NMEXatzfjvcbUA51W2Czlzc2pcLRJxZTk8QWLwKaCN8';

console.log('🚀 Starting E2E WebSocket Test...\n');

// Connect organizer
console.log('1️⃣  Connecting as Organizer...');
const organizerSocket = io('http://localhost:3005', {
  auth: { token: TOKEN },
  transports: ['websocket']
});

organizerSocket.on('connect', () => {
  console.log('✅ Organizer connected:', organizerSocket.id);

  // Join room as organizer
  console.log(`\n2️⃣  Joining room ${PIN} as organizer...`);
  organizerSocket.emit('join-room', {
    pin: PIN,
    nickname: 'E2E Organizer'
  });
});

organizerSocket.on('joined-room', (data) => {
  console.log('✅ Organizer joined room:', data);

  // Connect participant
  setTimeout(() => {
    console.log('\n3️⃣  Connecting as Participant...');
    const participantSocket = io('http://localhost:3005');

    participantSocket.on('connect', () => {
      console.log('✅ Participant connected:', participantSocket.id);

      // Join room as participant
      console.log(`\n4️⃣  Joining room ${PIN} as participant...`);
      participantSocket.emit('join-room', {
        pin: PIN,
        nickname: 'E2E Participant',
        deviceId: 'test-device-123'
      });
    });

    participantSocket.on('joined-room', (data) => {
      console.log('✅ Participant joined room:', data);

      // Start game
      setTimeout(() => {
        console.log('\n5️⃣  Starting game...');
        organizerSocket.emit('start-game', {
          pin: PIN,
          gameId: GAME_ID
        });
      }, 1000);
    });

    participantSocket.on('game-started', (data) => {
      console.log('✅ Game started:', data);

      // Submit answer
      setTimeout(() => {
        console.log('\n6️⃣  Submitting answer...');
        participantSocket.emit('submit-answer', {
          pin: PIN,
          questionIndex: 0,
          answer: 'true',
          responseTimeMs: 3000
        });
      }, 2000);
    });

    participantSocket.on('answer-received', (data) => {
      console.log('✅ Answer received:', data);
      console.log(`   - Correct: ${data.isCorrect}`);
      console.log(`   - Points: ${data.points}`);
      console.log(`   - Breakdown:`, data.breakdown);

      // End question
      setTimeout(() => {
        console.log('\n7️⃣  Ending question...');
        organizerSocket.emit('end-question', {
          pin: PIN,
          questionIndex: 0
        });
      }, 1000);
    });

    participantSocket.on('question-ended', (data) => {
      console.log('✅ Question ended:', data);
      console.log('   - Results:', data.results);
      console.log('   - Leaderboard:', data.leaderboard);
      console.log('   - Statistics:', data.statistics);

      console.log('\n✅ E2E TEST PASSED! All WebSocket events working correctly.');
      process.exit(0);
    });

    participantSocket.on('error', (error) => {
      console.error('❌ Participant error:', error);
      process.exit(1);
    });
  }, 1000);
});

organizerSocket.on('participant-joined', (data) => {
  console.log('✅ Player joined notification:', data);
});

organizerSocket.on('error', (error) => {
  console.error('❌ Organizer error:', error);
  process.exit(1);
});

// Timeout after 30 seconds
setTimeout(() => {
  console.error('\n❌ TEST TIMEOUT - Test did not complete within 30 seconds');
  process.exit(1);
}, 30000);
