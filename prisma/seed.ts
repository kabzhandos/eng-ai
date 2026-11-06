import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const GRAMMAR_TOPICS = [
  // A1 Topics
  {
    level: 'A1',
    title: 'Verb "to be" (Present)',
    slug: 'a1-verb-to-be',
    description: 'Forms am, is, are in positive, negative and question sentences.',
    systemPromptRules: 'Focus strictly on choosing the correct form of the verb "to be" (am, is, are, am not, isn\'t, aren\'t). If testing negative forms (am not, isn\'t, aren\'t), ALWAYS include (not) in the question prompt e.g. "I _____ (not) late", to prevent ambiguity with positive forms.',
    orderIndex: 1,
  },
  {
    level: 'A1',
    title: 'Present Simple (Daily Routines)',
    slug: 'a1-present-simple',
    description: 'Third person -s/-es endings, do/does in questions and negatives.',
    systemPromptRules: 'Focus on habits, daily routines, facts. Target 3rd person singular "-s/-es" agreement, and "don\'t / doesn\'t". If testing negation, include (not) in the prompt.',
    orderIndex: 2,
  },
  {
    level: 'A1',
    title: 'Articles & Plural Nouns',
    slug: 'a1-articles-plurals',
    description: 'Usage of a, an, the or no article, and regular/irregular plural nouns.',
    systemPromptRules: 'Focus on choosing correct article (a, an, the, zero article) and basic plural forms (books, cities, children).',
    orderIndex: 3,
  },

  // A2 Topics
  {
    level: 'A2',
    title: 'Past Simple (Regular & Irregular)',
    slug: 'a2-past-simple',
    description: 'Past tense endings (-ed), irregular verbs, did / didn\'t in negatives and questions.',
    systemPromptRules: 'Focus on common irregular verbs (went, bought, saw, had) vs regular verbs, and using "didn\'t + base form" in negatives.',
    orderIndex: 4,
  },
  {
    level: 'A2',
    title: 'Present Continuous (Actions in Progress)',
    slug: 'a2-present-continuous',
    description: 'am/is/are + verb-ing for actions happening now or around now.',
    systemPromptRules: 'Focus on actions happening right now. Contrast with stative verbs.',
    orderIndex: 5,
  },
  {
    level: 'A2',
    title: 'Comparatives & Superlatives',
    slug: 'a2-comparatives-superlatives',
    description: 'Short and long adjectives (-er/more, -est/most, good/better/best).',
    systemPromptRules: 'Focus on comparison structures using "than", "-er / more", and superlative with "the ... -est".',
    orderIndex: 6,
  },
  {
    level: 'A2',
    title: 'Modals: Can, Could, Must, Should',
    slug: 'a2-modal-verbs',
    description: 'Ability, permission, obligation and giving advice.',
    systemPromptRules: 'Focus on distinguishing ability (can/could), advice (should), and necessity/obligation (must / have to).',
    orderIndex: 7,
  },

  // B1 Topics
  {
    level: 'B1',
    title: 'Present Perfect vs Past Simple',
    slug: 'b1-present-perfect-vs-past-simple',
    description: 'Ever, never, just, already, yet, since, for vs specific past time markers.',
    systemPromptRules: 'Focus on key signal words: already, yet, since, for, just, ever vs yesterday, last night, two days ago.',
    orderIndex: 8,
  },
  {
    level: 'B1',
    title: 'First and Second Conditionals',
    slug: 'b1-conditionals-1-2',
    description: 'Real possibilities (If + Present, Will) and hypothetical present situations (If + Past, Would).',
    systemPromptRules: 'Focus on clause agreement: First Conditional vs Second Conditional.',
    orderIndex: 9,
  },
  {
    level: 'B1',
    title: 'Passive Voice (Present & Past)',
    slug: 'b1-passive-voice',
    description: 'is/are + V3 and was/were + V3 when the action is more important than the agent.',
    systemPromptRules: 'Focus on forming passive sentences: Present Passive and Past Simple Passive.',
    orderIndex: 10,
  },

  // B2 Topics
  {
    level: 'B2',
    title: 'Third & Mixed Conditionals',
    slug: 'b2-conditionals-3-mixed',
    description: 'Regrets about the past (If + had V3, would have V3) and mixed time frames.',
    systemPromptRules: 'Focus on Third Conditional structure (If + Past Perfect, would have + V3) expressing regrets.',
    orderIndex: 11,
  },
  {
    level: 'B2',
    title: 'Modal Verbs of Past Deduction',
    slug: 'b2-modals-of-deduction',
    description: 'must have, can\'t have, might/could have + V3 for past logical deductions.',
    systemPromptRules: 'Focus on logical deduction about past events based on clues.',
    orderIndex: 12,
  },
];

async function main() {
  console.log('Seeding grammar topics...');
  for (const topic of GRAMMAR_TOPICS) {
    await prisma.grammarTopic.upsert({
      where: { slug: topic.slug },
      update: topic,
      create: topic,
    });
  }

  console.log('Seeding demo users and classes...');
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Demo Teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@school.edu' },
    update: {},
    create: {
      email: 'teacher@school.edu',
      fullName: 'Анна Сергеевна (Учитель)',
      passwordHash: defaultPasswordHash,
      role: 'TEACHER',
      currentLevel: 'B2',
    },
  });

  // 2. Demo Class
  const demoClass = await prisma.class.upsert({
    where: { inviteCode: 'ENG10A' },
    update: {},
    create: {
      name: '10-А Английский (Профиль)',
      inviteCode: 'ENG10A',
      teacherId: teacher.id,
    },
  });

  // 3. Demo Student with Bottleneck
  const student = await prisma.user.upsert({
    where: { email: 'student@school.edu' },
    update: {},
    create: {
      email: 'student@school.edu',
      fullName: 'Михаил Смирнов',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      currentLevel: 'B1',
    },
  });

  // Link student to class
  await prisma.classMember.upsert({
    where: {
      classId_studentId: {
        classId: demoClass.id,
        studentId: student.id,
      },
    },
    update: {},
    create: {
      classId: demoClass.id,
      studentId: student.id,
    },
  });

  // Create a demonstration bottleneck for the student on "Present Perfect vs Past Simple"
  const b1Topic = await prisma.grammarTopic.findUnique({
    where: { slug: 'b1-present-perfect-vs-past-simple' },
  });

  if (b1Topic) {
    await prisma.studentTopicProgress.upsert({
      where: {
        userId_topicId: {
          userId: student.id,
          topicId: b1Topic.id,
        },
      },
      update: {
        totalAttempts: 7,
        failedAttempts: 6,
        consecutiveCorrect: 0,
        isBottleneck: true,
      },
      create: {
        userId: student.id,
        topicId: b1Topic.id,
        totalAttempts: 7,
        failedAttempts: 6,
        consecutiveCorrect: 0,
        isBottleneck: true,
        lastPracticedAt: new Date(),
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log('Demo Accounts:');
  console.log('  Teacher: teacher@school.edu / password123');
  console.log('  Student: student@school.edu / password123 (Class code: ENG10A)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
