const env = require('../config/env');
const { buildModuleContextContent } = require('./openaiQuizService');

const extractResponseText = (responsePayload) => {
  if (typeof responsePayload?.output_text === 'string') return responsePayload.output_text;

  const message = (responsePayload?.output || [])
    .flatMap((item) => item?.content || [])
    .find((content) => content?.type === 'output_text' && typeof content.text === 'string');

  return message?.text || '';
};

const buildAssistantInputContent = (module, message) => [
  ...buildModuleContextContent(module, {
    instructionLines: [
      'You are a helpful learning assistant for this training module.',
      'Answer using only the module title, description, videos, linked documents/files, and supplied file contents as source material when possible.',
      'If the answer is not in the module materials, say so and offer a brief general explanation only when it is clearly marked as general guidance.',
      'Do not reveal, identify, or imply correct quiz answers. You may explain concepts and guide the learner to review relevant material.',
      'Keep responses concise, educational, and actionable.'
    ]
  }),
  {
    type: 'input_text',
    text: `Learner message: ${String(message || '').trim()}`
  }
];

const generateModuleAssistantResponse = async (module, message) => {
  if (!env.openai.apiKey) {
    const error = new Error('OPENAI_API_KEY is not configured.');
    error.statusCode = 503;
    throw error;
  }

  const trimmedMessage = String(message || '').trim();
  if (!trimmedMessage) {
    const error = new Error('Message is required.');
    error.statusCode = 400;
    throw error;
  }

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
              text: 'You assist learners with training module content. Never disclose correct quiz answers or answer keys.'
            }
          ]
        },
        { role: 'user', content: buildAssistantInputContent(module, trimmedMessage) }
      ]
    })
  });

  const responsePayload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const messageText = responsePayload?.error?.message || `OpenAI Responses API failed with status ${response.status}.`;
    const error = new Error(messageText);
    error.statusCode = response.status;
    throw error;
  }

  const answer = extractResponseText(responsePayload).trim();
  if (!answer) {
    throw new Error('OpenAI response did not include assistant output.');
  }

  return answer;
};

const generateCourseInsightsForStudent = async (studentStats) => {
  if (!env.openai.apiKey) {
    console.warn('OPENAI_API_KEY is not configured. Returning fallback insights.');
    return generateFallbackInsights(studentStats);
  }

  const prompt = `
  Analyze the following student progress data for a specific course:
  ${JSON.stringify(studentStats, null, 2)}
  
  Generate a JSON response exactly matching this schema:
  {
    "stats": {
      "completedModules": "Number of modules fully completed / Total",
      "averageScore": "Average quiz score with a % symbol",
      "status": "A short, encouraging 2-word status like 'On Track', 'Needs Focus', etc."
    },
    "reminders": [
      "A short actionable reminder based on progress (max 8 words)",
      "Another short reminder (max 8 words)",
      "A final short reminder (max 8 words)"
    ],
    "news": [
      { "title": "Encouraging news or recent module info", "date": "Today's date or relevant date" },
      { "title": "Another news item", "date": "Relevant date" }
    ]
  }
  
  Keep text extremely concise as it will be rendered in small UI widgets. Do NOT use markdown code block wrappers (like \`\`\`json) in your response, return ONLY the raw JSON string.
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.openai.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using a faster/cheaper model for UI insights
        messages: [
          { role: 'system', content: 'You are a strict JSON data generator for a learning platform UI. Never output anything except valid JSON matching the requested schema.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    const responsePayload = await response.json();
    if (!response.ok) throw new Error(responsePayload?.error?.message || 'Failed to fetch AI insights');
    
    let answerText = responsePayload.choices[0].message.content.trim();
    
    // Remove potential markdown wrappers if the AI misbehaves
    if (answerText.startsWith('\`\`\`')) {
        answerText = answerText.replace(/^\`\`\`(json)?\n?/, '').replace(/\n?\`\`\`$/, '');
    }

    return JSON.parse(answerText);
  } catch (error) {
    console.error('Failed to generate AI insights, using fallback:', error);
    return generateFallbackInsights(studentStats);
  }
};

const generateFallbackInsights = (stats) => ({
  stats: {
    completedModules: `${stats.completedModules || 0}/${stats.totalModules || 0}`,
    averageScore: `${stats.averageScore || 0}%`,
    status: 'In Progress'
  },
  reminders: [
    "Keep up the good work!",
    "Review previous modules",
    "Prepare for the next quiz"
  ],
  news: [
    { title: "Course progress tracked", date: new Date().toLocaleDateString() },
    { title: "New content available soon", date: "Upcoming" }
  ]
});

module.exports = {
  buildAssistantInputContent,
  generateModuleAssistantResponse,
  generateCourseInsightsForStudent
};
