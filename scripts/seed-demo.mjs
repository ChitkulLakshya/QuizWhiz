#!/usr/bin/env node
/**
 * QuizWhiz demo seed — writes ONLY to the local Firebase Emulator Suite.
 *
 * Usage:
 *   firebase emulators:start          # auth on 127.0.0.1:9099, firestore on 127.0.0.1:8087
 *   npm run seed:demo                 # (optionally with FIREBASE_PROJECT_ID=demo-<something>)
 *
 * Collections seeded (exact field names read by the app see src/lib/firebase-service.ts):
 *
 *   admins                                → /login (isAdminEmail gate via src/lib/auth.ts)
 *   quizzes                               → /admin (getQuizzes), /join (getQuizByCode),
 *                                            /play/[quizId] (subscribeToQuiz/getQuiz)
 *   quizzes/{quizId}/questions            → /play/[quizId] (subscribeToQuestions),
 *                                            /admin/quiz/[quizId]/edit,
 *                                            /admin/quiz/[quizId]/leaderboard (getLeaderboard scoring)
 *   quizzes/{quizId}/participants         → /play/[quizId] + /admin/quiz/[quizId]/leaderboard
 *                                            (getLeaderboard), host/admin control lobby
 *                                            (subscribeToParticipants)
 *
 * Re-running is safe: every document has a fixed id and is upserted via PATCH,
 * so the second run overwrites the same documents with identical data.
 *
 * Node 20+, ESM, global fetch, zero dependencies.
 */

const AUTH_EMULATOR = process.env.AUTH_EMULATOR_URL || 'http://127.0.0.1:9099';
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_URL || 'http://127.0.0.1:8087';
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-quizwhiz';

const HOST_EMAIL = 'host@quizwhiz.dev';
const HOST_PASSWORD = 'QuizWhizDemo#2026';

if (!PROJECT_ID.startsWith('demo-')) {
  console.error(`❌ Refusing to seed project "${PROJECT_ID}".`);
  console.error('   This script may only write to emulator demo projects.');
  process.exit(1);
}

const quizBaseUrl = `${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ---------------------------------------------------------------------------
// Firestore REST value encoding helpers
// ---------------------------------------------------------------------------

function toValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === 'object') {
    const fields = {};
    for (const [k, val] of Object.entries(v)) fields[k] = toValue(val);
    return { mapValue: { fields } };
  }
  throw new Error(`Unsupported value: ${typeof v}`);
}

function enc(data) {
  const fields = {};
  for (const [k, v] of Object.entries(data)) fields[k] = toValue(v);
  return { fields };
}

async function upsert(collectionPath, docId, data) {
  const url = `${quizBaseUrl}/${collectionPath}/${docId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify(enc(data)),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Write failed ${collectionPath}/${docId}: HTTP ${res.status} ${body}`);
  }
  return collectionPath;
}

// ---------------------------------------------------------------------------
// Auth emulator: create or reuse the host user
// ---------------------------------------------------------------------------

async function authCall(operation, payload) {
  const res = await fetch(`${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/${operation}?key=demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, networkData: data };
}

async function ensureHostUser() {
  const first = await authCall('accounts:signUp', {
    email: HOST_EMAIL,
    password: HOST_PASSWORD,
    returnSecureToken: true,
  });
  if (first.ok) {
    console.log(`👤 Created host user ${HOST_EMAIL} (uid ${first.networkData.localId})`);
    return first.networkData.localId;
  }
  const message = first.networkData?.error?.message || '';
  if (first.status === 400 && /EMAIL_EXISTS/.test(message)) {
    const second = await authCall('accounts:signInWithPassword', {
      email: HOST_EMAIL,
      password: HOST_PASSWORD,
      returnSecureToken: true,
    });
    if (!second.ok) {
      throw new Error(`Host ${HOST_EMAIL} exists but the seeded password was rejected: ${JSON.stringify(second.networkData)}`);
    }
    console.log(`👤 Reusing existing host user ${HOST_EMAIL} (uid ${second.networkData.localId})`);
    return second.networkData.localId;
  }
  throw new Error(`Could not create host user: HTTP ${first.status} ${message}`);
}

// ---------------------------------------------------------------------------
// Demo content
// ---------------------------------------------------------------------------

const hostCreatedAt = new Date('2026-10-17T09:00:00.000Z').toISOString();

// Question shape mirrors src/types/quiz.ts Question (minus id/quizId).
// options + correctOptionIndex must always line up.
const demoQuizzes = [
  {
    id: 'quiz-marine-marvels',
    title: 'Marine Marvels',
    description: 'Dive into the deep blue: whales, reefs, dolphins and the strangest creatures under the sea.',
    status: 'lobby',
    code: '248610',
    createdAt: '2026-10-22T09:10:00.000Z',
    participantCount: 0,
    questions: [
      { questionText: 'Which animal is the largest on Earth?', options: ['African elephant', 'Blue whale', 'Orca', 'Whale shark'], correctOptionIndex: 1 },
      { questionText: 'How many hearts does an octopus have?', options: ['One', 'Two', 'Three', 'Four'], correctOptionIndex: 2 },
      { questionText: 'Among seahorses, which parent carries the young?', options: ['Mother in a pouch', 'Father in a brood pouch', 'Neither — they scatter eggs', 'They attach eggs to rocks'], correctOptionIndex: 1 },
      { questionText: 'Which fish is considered the fastest swimmer in the ocean?', options: ['Sailfish', 'Swordfish', 'Yellowfin tuna', 'Shortfin mako shark'], correctOptionIndex: 0 },
      { questionText: 'The Great Barrier Reef lies off the coast of which country?', options: ['Brazil', 'Australia', 'South Africa', 'Mexico'], correctOptionIndex: 1 },
      { questionText: 'Dolphins communicate with each other mainly using…', options: ['Colour changes', 'Clicks and whistles', 'Electric pulses', 'Ink trails'], correctOptionIndex: 1 },
      { questionText: 'Coral reefs are built by…', options: ['Plants related to algae', 'Tiny animals called polyps', 'Layered volcanic rock', 'Rooted underwater shrubs'], correctOptionIndex: 1 },
      { questionText: 'Which animal can regrow a lost arm — or even parts of its central disc?', options: ['Starfish (sea star)', 'Piranha', 'Anglerfish', 'Clownfish'], correctOptionIndex: 0 },
      { questionText: 'Bioluminescence in deep-sea creatures is produced by…', options: ['Pigments that reflect moonlight', 'Chemical reactions inside the organism', 'Superheated vent water', 'Static electricity in seawater'], correctOptionIndex: 1 },
      { questionText: 'Challenger Deep, the deepest surveyed point in the Mariana Trench, is about…', options: ['1,100 metres deep', '3,600 metres deep', '11,000 metres deep', '21,000 metres deep'], correctOptionIndex: 2 },
    ],
  },
  {
    id: 'quiz-world-capitals',
    title: 'World Capitals',
    description: 'A finished classroom showdown — eight players, one map, plenty of misplaced capitals.',
    status: 'completed',
    code: '715934',
    createdAt: '2026-10-18T18:00:00.000Z',
    participantCount: 8,
    questions: [
      { questionText: 'What is the capital of Japan?', options: ['Osaka', 'Tokyo', 'Kyoto', 'Seoul'], correctOptionIndex: 1 },
      { questionText: 'Which city is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correctOptionIndex: 2 },
      { questionText: 'What is the capital of Canada?', options: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'], correctOptionIndex: 3 },
      { questionText: 'Bern is the federal capital of which country?', options: ['Switzerland', 'Austria', 'Belgium', 'Norway'], correctOptionIndex: 0 },
      { questionText: 'What is the capital of Brazil?', options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'], correctOptionIndex: 2 },
      { questionText: 'Which city is the legislative capital of South Africa?', options: ['Cape Town', 'Pretoria', 'Bloemfontein', 'Johannesburg'], correctOptionIndex: 0 },
      { questionText: 'What is the capital of Morocco?', options: ['Casablanca', 'Marrakesh', 'Rabat', 'Fez'], correctOptionIndex: 2 },
      { questionText: 'What is the capital of New Zealand?', options: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton'], correctOptionIndex: 1 },
    ],
  },
  {
    id: 'quiz-space-astronomy',
    title: 'Space & Astronomy',
    description: 'Planets, probes and the physics of the very big and the very far.',
    status: 'lobby',
    code: '483276',
    createdAt: '2026-10-21T14:45:00.000Z',
    participantCount: 0,
    questions: [
      { questionText: 'Which planet is the largest in the Solar System?', options: ['Saturn', 'Neptune', 'Earth', 'Jupiter'], correctOptionIndex: 3 },
      { questionText: 'Who was the first human in space?', options: ['Yuri Gagarin', 'Neil Armstrong', 'Alan Shepard', 'Valentina Tereshkova'], correctOptionIndex: 0 },
      { questionText: 'Sunlight takes roughly how long to reach Earth?', options: ['About 1 minute', 'About 8 minutes', 'About 30 minutes', 'About 60 minutes'], correctOptionIndex: 1 },
      { questionText: 'Which moon has a dense atmosphere dominated by nitrogen?', options: ['Europa', 'Titan', 'Ganymede', 'Enceladus'], correctOptionIndex: 1 },
      { questionText: 'Our Solar System sits inside which galaxy?', options: ['Andromeda', 'Triangulum', 'Milky Way', 'Large Magellanic Cloud'], correctOptionIndex: 2 },
      { questionText: 'Mars gets its red colour mainly from…', options: ['Iron oxide (rust) dust', 'Sulphur deposits', 'Copper-rich rock', 'Frozen methane'], correctOptionIndex: 0 },
      { questionText: 'A light-year is a unit of…', options: ['Time', 'Brightness', 'Distance', 'Speed'], correctOptionIndex: 2 },
      { questionText: 'Which planet rotates on its side, with its axis tilted about 98°?', options: ['Venus', 'Uranus', 'Neptune', 'Mercury'], correctOptionIndex: 1 },
    ],
  },
  {
    id: 'quiz-nineties-pop-culture',
    title: '90s Pop Culture',
    description: 'Tamagotchis, boy bands and the console wars — nostalgia with the volume at ten.',
    status: 'lobby',
    code: '920145',
    createdAt: '2026-10-20T19:30:00.000Z',
    participantCount: 0,
    questions: [
      { questionText: 'Which Nintendo handheld, released in 1989, dominated gaming through the 90s?', options: ['Game Gear', 'Atari Lynx', 'Game Boy', 'Neo Geo Pocket'], correctOptionIndex: 2 },
      { questionText: 'In which year did Toy Story, the first fully CG feature film, hit cinemas?', options: ['1994', '1995', '1996', '1997'], correctOptionIndex: 1 },
      { questionText: 'Which group topped the charts with their debut single "Wannabe"?', options: ['Spice Girls', 'TLC', 'All Saints', 'En Vogue'], correctOptionIndex: 0 },
      { questionText: 'The Tamagotchi virtual pet was launched in which country?', options: ['Japan', 'United States', 'South Korea', 'United Kingdom'], correctOptionIndex: 0 },
      { questionText: 'In which year was The Matrix released?', options: ['1997', '1998', '1999', '2000'], correctOptionIndex: 2 },
      { questionText: 'Which sitcom finale in May 1994 drew one of the largest US TV audiences up to then?', options: ['Friends', 'Seinfeld', 'Home Improvement', 'Full House'], correctOptionIndex: 1 },
      { questionText: 'Which Sony console launched in Japan in December 1994?', options: ['PlayStation', 'Dreamcast', '3DO', 'Sega Saturn'], correctOptionIndex: 0 },
      { questionText: 'Who sang the 1999 debut hit "…Baby One More Time"?', options: ['Christina Aguilera', 'Britney Spears', 'Mandy Moore', 'Jessica Simpson'], correctOptionIndex: 1 },
    ],
  },
  {
    id: 'quiz-js-fundamentals',
    title: 'JavaScript Fundamentals',
    description: 'Coercion, equality and array methods — the seven minutes of trivia that cause seven days of debate.',
    status: 'lobby',
    code: '634092',
    createdAt: '2026-10-19T11:20:00.000Z',
    participantCount: 0,
    questions: [
      { questionText: 'Which keyword declares a block-scoped constant?', options: ['var', 'let', 'const', 'static'], correctOptionIndex: 2 },
      { questionText: 'What does `typeof null` return?', options: ['"null"', '"object"', '"undefined"', '"number"'], correctOptionIndex: 1 },
      { questionText: 'How does `0.1 + 0.2 === 0.3` evaluate?', options: ['true', 'false', 'TypeError', 'NaN'], correctOptionIndex: 1 },
      { questionText: 'Which method adds an element to the end of an array?', options: ['unshift', 'shift', 'push', 'pop'], correctOptionIndex: 2 },
      { questionText: 'What does `Array.isArray([])` return?', options: ['true', 'false', '"array"', 'undefined'], correctOptionIndex: 0 },
      { questionText: 'Compared with a plain object, a Map…', options: ['Only accepts string keys', 'Remembers insertion order and accepts any key type', 'Only accepts number keys', 'Sorts its keys alphabetically'], correctOptionIndex: 1 },
      { questionText: 'What does `===` test that `==` does not?', options: ['Value with type coercion allowed', 'Value AND type — no coercion', 'Reference equality only', 'Memory identity of strings'], correctOptionIndex: 1 },
      { questionText: 'What is `Boolean("")`?', options: ['true', 'false', 'undefined', 'A TypeError'], correctOptionIndex: 1 },
    ],
  },
  {
    id: 'quiz-indian-history',
    title: 'Indian History',
    description: 'From Mughal architecture to midnight freedom — emperors, movements and milestones.',
    status: 'lobby',
    code: '809531',
    createdAt: '2026-10-18T09:00:00.000Z',
    participantCount: 0,
    questions: [
      { questionText: 'Which Mughal emperor commissioned the Taj Mahal?', options: ['Akbar', 'Jahangir', 'Shah Jahan', 'Aurangzeb'], correctOptionIndex: 2 },
      { questionText: 'On which date did the Constitution of India come into force?', options: ['15 August 1947', '26 January 1950', '26 November 1949', '2 October 1950'], correctOptionIndex: 1 },
      { questionText: 'Who is known as the "Iron Man of India"?', options: ['Jawaharlal Nehru', 'Sardar Vallabhbhai Patel', 'Bhagat Singh', 'Subhas Chandra Bose'], correctOptionIndex: 1 },
      { questionText: 'Who led the 1930 Dandi Salt March?', options: ['Sardar Vallabhbhai Patel', 'Mahatma Gandhi', 'Jawaharlal Nehru', 'Rabindranath Tagore'], correctOptionIndex: 1 },
      { questionText: 'The Qutub Minar was first built by the rulers of which dynasty?', options: ['The Mamluk (Slave) dynasty', 'The Tughlaq dynasty', 'The Khalji dynasty', 'The Lodhi dynasty'], correctOptionIndex: 0 },
      { questionText: 'The Indian National Congress was founded in 1885 in which city?', options: ['Calcutta', 'Bombay', 'Madras', 'Delhi'], correctOptionIndex: 1 },
      { questionText: 'In which year did the Jallianwala Bagh massacre take place?', options: ['1905', '1919', '1930', '1942'], correctOptionIndex: 1 },
      { questionText: 'Emperor Ashoka the Great belonged to which dynasty?', options: ['Gupta', 'Maurya', 'Nanda', 'Chola'], correctOptionIndex: 1 },
    ],
  },
];

// One finished game (quiz status "completed") with real scores so the
// leaderboard pages (/play/[quizId] and /admin/quiz/[quizId]/leaderboard)
// have data. Correct indices for quiz-world-capitals: q0=1 q1=2 q2=3 q3=0 q4=2 q5=0 q6=2 q7=1.
const demoParticipants = [
  { id: 'player-athena', name: 'Athena', totalScore: 800, currentStreak: 8, answers: { 0: 1, 1: 2, 2: 3, 3: 0, 4: 2, 5: 0, 6: 2, 7: 1 } },
  { id: 'player-ash', name: 'Ash', totalScore: 700, currentStreak: 3, answers: { 0: 1, 1: 2, 2: 3, 3: 0, 4: 0, 5: 0, 6: 2, 7: 1 } },
  { id: 'player-bingo', name: 'Bingo', totalScore: 600, currentStreak: 2, answers: { 0: 1, 1: 2, 2: 1, 3: 0, 4: 2, 5: 1, 6: 2, 7: 1 } },
  { id: 'player-charli', name: 'Charli', totalScore: 500, currentStreak: 2, answers: { 0: 1, 1: 0, 2: 3, 3: 0, 4: 3, 5: 0, 6: 0, 7: 1 } },
  { id: 'player-delta', name: 'Delta', totalScore: 400, currentStreak: 2, answers: { 0: 0, 1: 2, 2: 3, 3: 1, 4: 2, 5: 1, 6: 2, 7: 0 } },
  { id: 'player-echo', name: 'Echo', totalScore: 300, currentStreak: 1, answers: { 0: 3, 1: 2, 2: 2, 3: 0, 4: 1, 5: 0, 6: 3, 7: 2 } },
  { id: 'player-foxtrot', name: 'Foxtrot', totalScore: 200, currentStreak: 1, answers: { 0: 2, 1: 2, 2: 0, 3: 2, 4: 0, 5: 0, 6: 1, 7: 3 } },
  { id: 'player-jupiter', name: 'Jupiter', totalScore: 100, currentStreak: 1, answers: { 0: 3, 1: 0, 2: 1, 3: 0, 4: 1, 5: 1, 6: 3, 7: 0 } },
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

const finishedQuizId = 'quiz-world-capitals';

async function seed() {
  console.log(`🧪 Seeding project ${PROJECT_ID} in the local emulators:`);
  console.log(`   Auth     → ${AUTH_EMULATOR}`);
  console.log(`   Firestore → ${FIRESTORE_EMULATOR}`);

  let hostUid;
  try {
    hostUid = await ensureHostUser();
  } catch (err) {
    console.error(`❌ Cannot reach the Auth emulator at ${AUTH_EMULATOR}.`);
    console.error('   Start it with "firebase emulators:start", then re-run  npm run seed:demo');
    console.error(`   (${err.message})`);
    process.exit(1);
  }
  if (!hostUid) {
    console.error('❌ Auth emulator returned no localId for the host user.');
    process.exit(1);
  }

  const written = { admins: 0, quizzes: 0, questions: 0, participants: 0 };

  try {
    // ---- admins (read by /login via src/lib/auth.ts) ----
    await upsert('admins', 'host-quizwhiz-dev', {
      email: HOST_EMAIL,
      createdAt: hostCreatedAt,
      role: 'super_admin',
    });
    written.admins += 1;

    // ---- quizzes + questions + participants ----
    // All writes go through PATCH on fixed document ids so re-running upserts.
    for (const quiz of demoQuizzes) {
      await upsert('quizzes', quiz.id, {
        title: quiz.title,
        description: quiz.description,
        createdBy: HOST_EMAIL,
        ownerId: hostUid,
        createdAt: quiz.createdAt,
        status: quiz.status,
        source: 'manual',
        currentQuestionIndex: quiz.status === 'completed' ? quiz.questions.length - 1 : -1,
        code: quiz.code,
        participantCount: quiz.participantCount,
      });
      written.quizzes += 1;

      await Promise.all(
        quiz.questions.map((q, index) =>
          upsert(`quizzes/${quiz.id}/questions`, `${quiz.id}-q${String(index + 1).padStart(2, '0')}`, {
            questionText: q.questionText,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex,
            timeLimit: 20,
            points: 100,
            order: index,
            quizId: quiz.id,
          })
        )
      );
      written.questions += quiz.questions.length;

      if (quiz.id === finishedQuizId) {
        await Promise.all(
          demoParticipants.map((p, index) => {
            // Firestore REST map field: { "<questionIndex>": selectedOptionIndex }
            const answerMap = {};
            for (const [qi, opt] of Object.entries(p.answers)) answerMap[String(qi)] = opt;
            const joinedAt = new Date(new Date(quiz.createdAt).getTime() + (index + 1) * 45_000).toISOString();
            return upsert(`quizzes/${quiz.id}/participants`, p.id, {
              name: p.name,
              quizId: quiz.id,
              joinedAt,
              totalScore: p.totalScore,
              currentStreak: p.currentStreak,
              answers: answerMap,
              votedToSkip: false,
            });
          })
        );
        written.participants += demoParticipants.length;
      }
    }

    console.log('');
    console.log('✅ Seed complete. Summary:');
    console.log(`   admins                     ${written.admins} doc      (host ${HOST_EMAIL})`);
    console.log(`   quizzes                    ${written.quizzes} docs     (1 completed: ${finishedQuizId})`);
    console.log(`   quizzes/*/questions        ${written.questions} docs`);
    console.log(`   quizzes/*/participants     ${written.participants} docs     (leaderboard data)`);
    console.log('');
    console.log('   Log in at /login with:');
    console.log(`     ${HOST_EMAIL} / ${HOST_PASSWORD}`);
    console.log('   Join codes (findable on /join):');
    for (const quiz of demoQuizzes) console.log(`     ${quiz.code} → ${quiz.title}`);
  } catch (err) {
    console.error(`❌ Cannot reach the Firestore emulator at ${FIRESTORE_EMULATOR}.`);
    console.error('   Start it with "firebase emulators:start", then re-run  npm run seed:demo');
    console.error(`   (${err.message})`);
    process.exit(1);
  }
}

await seed();
