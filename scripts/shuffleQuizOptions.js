#!/usr/bin/env node
/*
 * Shuffle existing quiz answer alternatives while preserving exactly one correct answer.
 *
 * Default is dry-run. Use --apply to write changes.
 * By default, questions with submitted answers are skipped to avoid changing historical answer semantics.
 * Use --include-answered only if you intentionally want to reshuffle quizzes that already have submissions.
 */
const prisma = require('../config/db');
const { createSeededRandom, shuffleArray } = require('../services/openaiQuizService');

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const includeAnswered = args.has('--include-answered');
const moduleIdArg = [...args].find((arg) => arg.startsWith('--module-id='));
const quizIdArg = [...args].find((arg) => arg.startsWith('--quiz-id='));
const moduleId = moduleIdArg ? Number.parseInt(moduleIdArg.split('=')[1], 10) : null;
const quizId = quizIdArg ? Number.parseInt(quizIdArg.split('=')[1], 10) : null;

const usage = () => {
  console.log(`Usage: node scripts/shuffleQuizOptions.js [--apply] [--include-answered] [--module-id=123] [--quiz-id=456]\n\nDefault mode is dry-run. It reports what would change without writing to the database.`);
};

if (args.has('--help') || args.has('-h')) {
  usage();
  process.exit(0);
}

if (moduleIdArg && !Number.isFinite(moduleId)) {
  console.error('Invalid --module-id value.');
  process.exit(1);
}
if (quizIdArg && !Number.isFinite(quizId)) {
  console.error('Invalid --quiz-id value.');
  process.exit(1);
}

const optionSignature = (options) => options.map((option) => `${option.id}:${option.text}:${option.isCorrect ? '1' : '0'}`).join('|');

const main = async () => {
  const where = {};
  if (quizId) where.id = quizId;
  if (moduleId) where.moduleId = moduleId;

  const quizzes = await prisma.quiz.findMany({
    where,
    orderBy: [{ moduleId: 'asc' }, { order: 'asc' }, { id: 'asc' }],
    include: {
      module: { select: { id: true, title: true } },
      questions: {
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
        include: {
          options: { orderBy: { id: 'asc' } },
          answers: { select: { id: true }, take: 1 }
        }
      }
    }
  });

  const report = {
    mode: apply ? 'apply' : 'dry-run',
    filters: { moduleId, quizId },
    quizzes: quizzes.length,
    questionsSeen: 0,
    questionsShuffled: 0,
    skippedMalformed: 0,
    skippedAnswered: 0,
    unchanged: 0,
    changes: []
  };

  const updates = [];

  for (const quiz of quizzes) {
    for (const question of quiz.questions || []) {
      report.questionsSeen += 1;
      const options = question.options || [];
      const correctCount = options.filter((option) => option.isCorrect).length;
      if (options.length < 2 || correctCount !== 1) {
        report.skippedMalformed += 1;
        continue;
      }
      if (!includeAnswered && (question.answers || []).length > 0) {
        report.skippedAnswered += 1;
        continue;
      }

      const random = createSeededRandom(`${quiz.id}:${question.id}:${optionSignature(options)}`);
      let shuffled = shuffleArray(options.map((option) => ({ text: option.text, isCorrect: option.isCorrect })), random);
      const beforeCorrectIndex = options.findIndex((option) => option.isCorrect);

      // If the deterministic shuffle keeps an originally-first correct answer first, rotate once.
      // Also rotate if it produced the exact same order.
      const sameOrder = shuffled.map((option) => `${option.text}:${option.isCorrect}`).join('|') === options.map((option) => `${option.text}:${option.isCorrect}`).join('|');
      if ((beforeCorrectIndex === 0 && shuffled.findIndex((option) => option.isCorrect) === 0 && shuffled.length > 1) || sameOrder) {
        shuffled = [...shuffled.slice(1), shuffled[0]];
      }

      const afterCorrectIndex = shuffled.findIndex((option) => option.isCorrect);
      const changed = options.some((option, index) => option.text !== shuffled[index].text || option.isCorrect !== shuffled[index].isCorrect);
      if (!changed) {
        report.unchanged += 1;
        continue;
      }

      report.questionsShuffled += 1;
      report.changes.push({
        moduleId: quiz.moduleId,
        moduleTitle: quiz.module?.title || null,
        quizId: quiz.id,
        quizTitle: quiz.title,
        questionId: question.id,
        beforeCorrectIndex,
        afterCorrectIndex
      });

      options.forEach((option, index) => {
        updates.push(prisma.quizOption.update({
          where: { id: option.id },
          data: {
            text: shuffled[index].text,
            isCorrect: shuffled[index].isCorrect
          }
        }));
      });
    }
  }

  if (apply && updates.length) {
    const batchSize = 40;
    for (let index = 0; index < updates.length; index += batchSize) {
      await prisma.$transaction(updates.slice(index, index + batchSize), { timeout: 30000 });
    }
  }

  console.log(JSON.stringify(report, null, 2));
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {});
  });
