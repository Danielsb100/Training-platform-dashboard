const env = require('../config/env');

const DEFAULT_QUESTION_COUNT = 5;
const DEFAULT_OPTIONS_PER_QUESTION = 4;
// Quiz generation sends files directly in the Responses request. Even with a short
// prompt, OpenAI parses supplied files into the model context, so raw upload byte
// limits must be far below generic API upload limits to avoid context-window errors.
const MAX_FILE_BYTES_PER_ITEM = 1024 * 1024;
const MAX_TOTAL_FILE_BYTES = 3 * 1024 * 1024;
const MAX_QUIZ_FILE_INPUTS = 5;
const SUPPORTED_OPENAI_FILE_MIME_TYPES = new Set([
  'application/pdf',
  'application/json',
  'text/csv',
  'text/html',
  'text/markdown',
  'text/plain'
]);
const SUPPORTED_OPENAI_FILE_EXTENSIONS = new Set(['.csv', '.htm', '.html', '.json', '.md', '.pdf', '.txt']);

const getFileExtension = (filename = '') => {
  const match = String(filename || '').toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? match[0] : '';
};

const isSupportedOpenAiFile = (doc = {}) => {
  const mimeType = String(doc.type || '').toLowerCase().split(';')[0].trim();
  if (mimeType.startsWith('text/')) return true;
  if (SUPPORTED_OPENAI_FILE_MIME_TYPES.has(mimeType)) return true;
  return SUPPORTED_OPENAI_FILE_EXTENSIONS.has(getFileExtension(doc.name));
};

const createSeededRandom = (seed = '') => {
  let state = 2166136261;
  for (const char of String(seed)) {
    state ^= char.charCodeAt(0);
    state = Math.imul(state, 16777619);
  }
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleArray = (items = [], random = Math.random) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const clampInt = (value, fallback, min, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

const getModuleAssetUrl = (url = '') => {
  const match = String(url).match(/\/api\/documents\/download\/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
};

const normalizeGeneratedQuiz = (payload, questionCount, optionsPerQuestion, options = {}) => {
  const random = typeof options.random === 'function'
    ? options.random
    : createSeededRandom(JSON.stringify(payload?.questions || []));
  const rawQuestions = Array.isArray(payload?.questions) ? payload.questions : [];
  const questions = rawQuestions.slice(0, questionCount).map((question, questionIndex) => {
    const rawOptions = Array.isArray(question.options) ? question.options : [];
    const options = rawOptions
      .slice(0, optionsPerQuestion)
      .map((option, optionIndex) => ({
        text: String(option?.text || '').trim(),
        isCorrect: Boolean(option?.isCorrect) || Number(question.correctOptionIndex) === optionIndex
      }))
      .filter((option) => option.text);

    if (!options.some((option) => option.isCorrect) && options.length > 0) {
      options[0].isCorrect = true;
    }

    const firstCorrectIndex = options.findIndex((option) => option.isCorrect);
    options.forEach((option, optionIndex) => {
      option.isCorrect = optionIndex === firstCorrectIndex;
    });

    let shuffledOptions = shuffleArray(options, random);
    if (firstCorrectIndex === 0 && shuffledOptions.findIndex((option) => option.isCorrect) === 0 && shuffledOptions.length > 1) {
      shuffledOptions = [...shuffledOptions.slice(1), shuffledOptions[0]];
    }

    return {
      text: String(question?.text || question?.question || '').trim(),
      order: questionIndex,
      options: shuffledOptions
    };
  }).filter((question) => question.text && question.options.length >= 2);

  return {
    title: String(payload?.title || 'AI Generated Quiz').trim().slice(0, 160),
    questions
  };
};

const buildQuizJsonSchema = (questionCount, optionsPerQuestion) => ({
  type: 'object',
  additionalProperties: false,
  required: ['title', 'questions'],
  properties: {
    title: {
      type: 'string',
      description: 'Short title for the generated quiz/test.'
    },
    questions: {
      type: 'array',
      minItems: questionCount,
      maxItems: questionCount,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['text', 'options'],
        properties: {
          text: {
            type: 'string',
            description: 'Question text.'
          },
          options: {
            type: 'array',
            minItems: optionsPerQuestion,
            maxItems: optionsPerQuestion,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['text', 'isCorrect'],
              properties: {
                text: { type: 'string' },
                isCorrect: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  }
});

const extractResponseText = (responsePayload) => {
  if (typeof responsePayload?.output_text === 'string') return responsePayload.output_text;

  const message = (responsePayload?.output || [])
    .flatMap((item) => item?.content || [])
    .find((content) => content?.type === 'output_text' && typeof content.text === 'string');

  return message?.text || '';
};

const getDocumentBuffer = (doc = {}) => {
  if (!doc?.data) return null;
  return Buffer.isBuffer(doc.data) ? doc.data : Buffer.from(doc.data);
};

const appendSupportedDocumentInput = ({ content, doc, label, budget }) => {
  if (!doc?.name || !doc?.type) return budget;

  if (!isSupportedOpenAiFile(doc)) {
    content.push({
      type: 'input_text',
      text: `Skipped ${label} ${doc.name}: file type ${doc.type || 'unknown'} is not supported for OpenAI quiz generation.`
    });
    return budget;
  }

  const buffer = getDocumentBuffer(doc);
  if (!buffer) {
    content.push({
      type: 'input_text',
      text: `Skipped ${label} ${doc.name}: file bytes are not available to the AI quiz generator.`
    });
    return budget;
  }

  if (budget.fileCount >= MAX_QUIZ_FILE_INPUTS) {
    content.push({
      type: 'input_text',
      text: `Skipped ${label} ${doc.name}: quiz generation already included ${MAX_QUIZ_FILE_INPUTS} files, which is the safe context limit.`
    });
    return budget;
  }

  if (buffer.length > MAX_FILE_BYTES_PER_ITEM || budget.totalBytes + buffer.length > MAX_TOTAL_FILE_BYTES) {
    content.push({
      type: 'input_text',
      text: `Skipped ${label} ${doc.name}: size ${buffer.length} bytes exceeds safe AI quiz context limits.`
    });
    return budget;
  }

  content.push({
    type: 'input_file',
    filename: doc.name,
    file_data: `data:${doc.type};base64,${buffer.toString('base64')}`
  });
  return {
    totalBytes: budget.totalBytes + buffer.length,
    fileCount: budget.fileCount + 1
  };
};

const buildModuleContextContent = (module, options = {}) => {
  const instructionLines = Array.isArray(options.instructionLines) ? options.instructionLines : [];
  const content = [];

  content.push({
    type: 'input_text',
    text: [
      ...instructionLines,
      instructionLines.length ? '' : null,
      '',
      `Module title: ${module.title || 'Untitled module'}`,
      `Module description: ${module.description || 'No description provided.'}`,
      '',
      'Videos:',
      ...(module.videos || []).map((video, index) => `${index + 1}. ${video.title || 'Untitled video'} — ${video.url || 'No URL'}`),
      '',
      'Documents/files:',
      ...(module.documents || []).map((moduleDocument, index) => {
        const doc = moduleDocument.document;
        return `${index + 1}. ${moduleDocument.title || doc?.name || 'Untitled file'} (${doc?.type || 'unknown type'})`;
      }),
      '',
      ...(module.quizzes || []).length ? ['Quiz questions (correct answers intentionally omitted):'] : [],
      ...(module.quizzes || []).flatMap((quiz, quizIndex) => [
        `${quizIndex + 1}. ${quiz.title || 'Untitled quiz'}`,
        ...(quiz.questions || []).map((question, questionIndex) => {
          const optionsText = (question.options || [])
            .map((option, optionIndex) => `${String.fromCharCode(65 + optionIndex)}. ${option.text || ''}`)
            .join(' | ');
          return `   Q${questionIndex + 1}. ${question.text || ''}${optionsText ? ` Options: ${optionsText}` : ''}`;
        })
      ])
    ].filter((line) => line !== null).join('\n')
  });

  if (options.includeFiles === false) {
    content.push({
      type: 'input_text',
      text: 'File contents were intentionally not attached for this quiz attempt to stay within the model context window. Use the module metadata, video titles, document names, and any available descriptions to create the quiz.'
    });
    return content;
  }

  const documentEntries = (module.documents || []).map((moduleDocument) => ({
    moduleDocument,
    doc: moduleDocument.document,
    label: 'file'
  }));
  const videoEntries = (module.videos || []).map((video) => {
    const documentId = getModuleAssetUrl(video.url);
    const doc = documentId
      ? (module.videoAssetDocuments || []).find((candidate) => candidate.id === documentId)
      : null;
    return { moduleDocument: null, doc, label: 'video asset' };
  });
  const materialEntries = [...documentEntries, ...videoEntries]
    .filter((entry) => entry.doc)
    .sort((a, b) => {
      const aSize = getDocumentBuffer(a.doc)?.length || Number.MAX_SAFE_INTEGER;
      const bSize = getDocumentBuffer(b.doc)?.length || Number.MAX_SAFE_INTEGER;
      return aSize - bSize;
    });

  let budget = { totalBytes: 0, fileCount: 0 };
  for (const entry of materialEntries) {
    budget = appendSupportedDocumentInput({ content, doc: entry.doc, label: entry.label, budget });
  }

  return content;
};

const buildModuleInputContent = (module, options = {}) => {
  const questionCount = clampInt(options.questionCount, DEFAULT_QUESTION_COUNT, 1, 30);
  const optionsPerQuestion = clampInt(options.optionsPerQuestion, DEFAULT_OPTIONS_PER_QUESTION, 2, 8);
  const content = buildModuleContextContent(module, {
    includeFiles: options.includeFiles,
    instructionLines: [
      `Create a ${questionCount}-question test/quiz for this training module.`,
      'Write the quiz title, questions, and answer options in English.',
      `Each question must have exactly ${optionsPerQuestion} options and exactly one correct option.`,
      'Use the module title, description, videos, linked documents/files, and any supplied file contents as source material.',
      'Avoid questions that depend on external knowledge not present in the module materials.'
    ]
  });

  return { content, questionCount, optionsPerQuestion };
};

const isContextWindowError = (message = '') => /context window|context length|maximum context|too many tokens|input exceeds/i.test(String(message || ''));

const requestQuizResponse = async ({ content, questionCount, optionsPerQuestion }) => {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openai.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: env.openai.quizModel,
      reasoning: {
        effort: env.openai.reasoningEffort
      },
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: 'You generate pedagogically useful multiple-choice tests from training module materials. Return only data that conforms to the requested schema.'
            }
          ]
        },
        { role: 'user', content }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'module_quiz',
          strict: true,
          schema: buildQuizJsonSchema(questionCount, optionsPerQuestion)
        }
      }
    })
  });

  const responsePayload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = responsePayload?.error?.message || `OpenAI Responses API failed with status ${response.status}.`;
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }
  return responsePayload;
};

const generateQuizFromModule = async (module, options = {}) => {
  if (!env.openai.apiKey) {
    const error = new Error('OPENAI_API_KEY is not configured.');
    error.statusCode = 503;
    throw error;
  }

  const { content, questionCount, optionsPerQuestion } = buildModuleInputContent(module, options);
  let responsePayload;
  try {
    responsePayload = await requestQuizResponse({ content, questionCount, optionsPerQuestion });
  } catch (error) {
    if (!isContextWindowError(error.message)) throw error;
    console.warn('AI quiz generation exceeded context window; retrying without attached file contents.');
    const fallback = buildModuleInputContent(module, { ...options, includeFiles: false });
    responsePayload = await requestQuizResponse({
      content: fallback.content,
      questionCount: fallback.questionCount,
      optionsPerQuestion: fallback.optionsPerQuestion
    });
  }

  const responseText = extractResponseText(responsePayload);
  if (!responseText) {
    throw new Error('OpenAI response did not include structured quiz output.');
  }

  return normalizeGeneratedQuiz(JSON.parse(responseText), questionCount, optionsPerQuestion);
};

const LOCALE_NAMES = {
  'en-US': 'English',
  'pt-BR': 'Brazilian Portuguese',
  'es-ES': 'Spanish',
  'it-IT': 'Italian',
  'fr-FR': 'French',
  'ro-RO': 'Romanian',
  'de-DE': 'German',
  'sq-AL': 'Albanian',
  'el-GR': 'Greek',
  'ru-RU': 'Russian'
};

const translateQuiz = async (quiz, targetLocale) => {
  if (!env.openai.apiKey) {
    const error = new Error('OPENAI_API_KEY is not configured.');
    error.statusCode = 503;
    throw error;
  }

  const targetLanguage = LOCALE_NAMES[targetLocale] || targetLocale;
  const questionCount = (quiz.questions || []).length;
  if (questionCount === 0) {
    return { title: quiz.title, questions: [] };
  }

  // Build a structured representation of the quiz for translation
  const quizData = {
    title: quiz.title,
    questions: (quiz.questions || []).map((q) => ({
      text: q.text,
      options: (q.options || []).map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect
      }))
    }))
  };

  const optionsPerQuestion = quizData.questions[0]?.options?.length || 4;

  const content = [
    {
      type: 'input_text',
      text: [
        `Translate the following quiz to ${targetLanguage}.`,
        'IMPORTANT RULES:',
        '- Translate ONLY the text content (title, question text, option text).',
        '- Keep EXACTLY the same number of questions and options.',
        '- Keep the EXACT SAME isCorrect value for each option — do NOT change which option is correct.',
        '- Do not add, remove, or reorder any questions or options.',
        '- Return the translated quiz in the exact same JSON structure.',
        '',
        'Quiz to translate:',
        JSON.stringify(quizData, null, 2)
      ].join('\n')
    }
  ];

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openai.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: env.openai.translationModel || 'gpt-5-nano',
      reasoning: { effort: env.openai.reasoningEffort },
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: 'You are a professional translator. You translate quiz content between languages while preserving the exact structure, question order, option order, and correct answer markers. Return only JSON data matching the requested schema.'
            }
          ]
        },
        { role: 'user', content }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'translated_quiz',
          strict: true,
          schema: buildQuizJsonSchema(questionCount, optionsPerQuestion)
        }
      }
    })
  });

  const responsePayload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = responsePayload?.error?.message || `OpenAI translation failed with status ${response.status}.`;
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  const responseText = extractResponseText(responsePayload);
  if (!responseText) {
    throw new Error('OpenAI response did not include translated quiz output.');
  }

  const parsed = JSON.parse(responseText);

  // Restore isCorrect values from original in case AI changed them
  const translatedQuestions = (parsed.questions || []).map((tq, qi) => {
    const original = quizData.questions[qi];
    if (!original) return tq;
    return {
      ...tq,
      options: (tq.options || []).map((to, oi) => ({
        text: to.text,
        isCorrect: original.options[oi]?.isCorrect || false
      }))
    };
  });

  return {
    title: parsed.title || quiz.title,
    questions: translatedQuestions
  };
};

module.exports = {
  DEFAULT_QUESTION_COUNT,
  DEFAULT_OPTIONS_PER_QUESTION,
  buildModuleContextContent,
  buildModuleInputContent,
  buildQuizJsonSchema,
  clampInt,
  createSeededRandom,
  generateQuizFromModule,
  getModuleAssetUrl,
  isSupportedOpenAiFile,
  normalizeGeneratedQuiz,
  shuffleArray,
  translateQuiz,
  LOCALE_NAMES
};
