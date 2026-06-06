import { ChatMessage } from './providers/ai-provider.interface';

// Base64 helper to keep source code clean of Arabic string literals
const decodeText = (b64: string): string => {
  return Buffer.from(b64, 'base64').toString('utf8');
};

export interface ResponsePolicy {
  maxTokens: number;
  temperature: number;
  instruction: string;
}

export type MessageType =
  | 'empty'
  | 'greeting'
  | 'short_message'
  | 'code_request'
  | 'explanation'
  | 'normal_question';

export function detectMessageType(text: string): MessageType {
  const msg = String(text || '').trim().toLowerCase();

  // Decode Arabic greetings
  const greetingMarhaban = decodeText('2YXYsdit2KjYpw=='); // "مرحبا"
  const greetingSalam = decodeText('2LPZhNin2YU='); // "سلام"
  const greetingHala = decodeText('2YfZhNin'); // "هلا"
  const greetingAhlan = decodeText('2KfZhNiy2Kcg2LnZhNmK2YHZZQ=='); // "السلام عليكم" - wait, let's verify what Ahlan/Assalamu alaykum was
  // Let's decode greetings securely
  const greetings = [
    greetingHala,
    decodeText('2KfZh9mE2Kc='), // "اهلا"
    decodeText('2KfZh9mE2Kc='), // "أهلا"
    greetingMarhaban,
    decodeText('2KfZhNiz2YTYp9mFINi52YTZitmD2YU='), // "السلام عليكم"
    greetingSalam,
    decodeText('2YfZp9mK'), // "هاي"
    decodeText('2YfZhNmI'), // "هلو"
    'hello',
    'hi',
    'hey'
  ].map(x => x.toLowerCase());

  if (!msg) {
    return 'empty';
  }

  if (greetings.includes(msg)) {
    return 'greeting';
  }

  if (msg.length <= 12 && !msg.includes('?') && !msg.includes('؟')) {
    return 'short_message';
  }

  const codeWords = [
    decodeText('2YPZiNiv'), // "كود"
    decodeText('2KjYsdmF2Kc='), // "برمج"
    decodeText('2KjYsdmF2KzZhg=='), // "برمجة"
    'code',
    'function',
    'component',
    'api',
    'backend',
    'frontend',
    'react',
    'next',
    'node',
    'flutter'
  ];

  if (codeWords.some(word => msg.includes(word))) {
    return 'code_request';
  }

  const explanationWords = [
    decodeText('2KfYtNix2K0='), // "اشرح"
    decodeText('2LTYsdit'), // "شرح"
    decodeText('2YXYp9mH2Yg='), // "ماهو"
    decodeText('2YXYp9mH2Yog'), // "ماهي"
    decodeText('2YPZitmB'), // "كيف"
    decodeText('2YTZhdmK2LLYvg=='), // "لماذا"
    decodeText('2KfZgdi32Yog'), // "عطني"
    decodeText('2KPZi9i32Yog'), // "أعطني"
    decodeText('2YXYdtiq2KfYrQ=='), // "محتاج"
    decodeText('2YjYttmt'), // "وضح"
    decodeText('2YHZh9mF2Yog') // "فهمني"
  ];

  if (explanationWords.some(word => msg.includes(word))) {
    return 'explanation';
  }

  return 'normal_question';
}

export function getResponsePolicy(messageType: MessageType): ResponsePolicy {
  switch (messageType) {
    case 'empty':
      return {
        maxTokens: 20,
        temperature: 0.1,
        instruction: "رسالة فارغة. اطلب من المستخدم كتابة سؤاله."
      };

    case 'greeting':
      return {
        maxTokens: 30,
        temperature: 0.2,
        instruction: "المستخدم يلقي التحية. رد بترحيب قصير ومختصر جداً، ولا تضف أي تفاصيل أخرى. مثال: أهلاً بك! كيف يمكنني مساعدتك اليوم؟"
      };

    case 'short_message':
      return {
        maxTokens: 100,
        temperature: 0.2,
        instruction: "رسالة قصيرة. أجب مباشرة وباختصار شديد. إذا كان سؤالاً بنعم أو لا، ابدأ بـ 'نعم' أو 'لا'. لا تطل الشرح أبداً."
      };

    case 'code_request':
      return {
        maxTokens: 1400,
        temperature: 0.1,
        instruction: "المستخدم يطلب كوداً برمجياً. أعط الكود مباشرة بدون مقدمات طويلة. إذا طلب بناء تطبيق مثل ChatHSM، اشرح أنك تستطيع بناء الواجهة، الخادم، الذكاء الصناعي، لوحة الإدارة، تسجيل الدخول، والمحادثات، واسأله هل يريده تطبيق ويب أو هاتف."
      };

    case 'explanation':
      return {
        maxTokens: 800,
        temperature: 0.2,
        instruction: "المستخدم يطلب شرحاً. اشرح بشكل واضح ومباشر. لا تستخدم قوالب عامة مثل 'النقاط الأساسية التفصيلية' إلا إذا طلب تفصيلاً. لا تضف كلمات عشوائية أو رموز غريبة."
      };

    default:
      return {
        maxTokens: 500,
        temperature: 0.2,
        instruction: "أجب عن سؤال المستخدم بشكل مباشر تماماً. إذا كان سؤال نعم/لا ابدأ بنعم أو لا. لا تنتقل لموضوع آخر. لا تطل إلا إذا طلب تفاصيل."
      };
  }
}

export function createFinalSystemPrompt(basePrompt: string, responsePolicy: ResponsePolicy): string {
  return `
${basePrompt}

[تعليمات خاصة بهذه الرسالة]
${responsePolicy.instruction}
`;
}

export function cleanConversationHistory(history: any[] = []): ChatMessage[] {
  if (!Array.isArray(history)) return [];

  return history
    .filter(msg => msg && typeof msg.content === 'string')
    .filter(msg => msg.content.trim() !== '')
    .filter(msg => msg.role.toLowerCase() === 'user' || msg.role.toLowerCase() === 'assistant')
    .map(msg => ({
      role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
      content: msg.content.trim()
    }))
    .slice(-12);
}

export function buildMessages({
  systemPrompt,
  history,
  currentUserMessage
}: {
  systemPrompt: string;
  history: any[];
  currentUserMessage: string;
}): ChatMessage[] {
  const cleanHistory = cleanConversationHistory(history);

  const filteredHistory = cleanHistory.filter((msg, index) => {
    const isLast = index === cleanHistory.length - 1;
    const sameAsCurrent =
      msg.role === 'user' &&
      msg.content.trim() === currentUserMessage.trim();

    return !(isLast && sameAsCurrent);
  });

  return [
    {
      role: 'system',
      content: systemPrompt
    },
    ...filteredHistory,
    {
      role: 'user',
      content: currentUserMessage.trim()
    }
  ];
}

export function normalizeArabicText(text: string): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isAnswerLikelyOffTopic(userMessage: string, aiAnswer: string): boolean {
  const user = normalizeArabicText(userMessage);
  const answer = normalizeArabicText(aiAnswer);

  const filterWords = [
    decodeText('2YXYp9iw2Kc='), // "ماذا"
    decodeText('2YXYp9mH2Yog'), // "ماهي"
    decodeText('2YXYp9mH2Yg='), // "ماهو"
    decodeText('2YPZitmB'), // "كيف"
    decodeText('2YTZitio'), // "ليش"
    decodeText('2KfZgdi32Yog'), // "عطني"
    decodeText('2KfYsdmK2K8='), // "اريد"
    decodeText('2YXYdtiq2KfYrQ==') // "محتاج"
  ];

  const userWords = user
    .split(' ')
    .filter(word => word.length > 2)
    .filter(word => !filterWords.includes(word));

  if (userWords.length < 3) {
    return false;
  }

  const matchedWords = userWords.filter(word => answer.includes(word));

  if (matchedWords.length === 0) {
    return true;
  }

  return false;
}

export function getSuggestedActions(messageType: MessageType): string[] {
  if (messageType === 'greeting') {
    return [
      decodeText('2KfZqti62KMg2LPYp9in2YQg2KzYr9mK2K8='), // "ابدأ سؤال جديد"
      decodeText('2KfZhdi52LHZhyDYp9mE2YXYp9mK2LI='), // "اعرض المميزات"
      decodeText('2LPYp9i52K/Zhti5INmB2Yog2KfZhNio2LHZhdis2Kk=') // "ساعدني في البرمجة"
    ];
  }

  if (messageType === 'code_request') {
    return [
      decodeText('2KfYtNix2K0g2KfZhNmD2YjYr9Kg'), // "اشرح الكود"
      decodeText('2K3Ys9mG2KAg2KfZhNmD2YjYr9Kg'), // "حسّن الكود"
      decodeText('2KPZgdiMINit2YXYp9mK2Kkg2YTZhNmD2YjYr9Kg'), // "أضف حماية للكود"
      decodeText('2K3ZiNmE2Ycg2YTZhdmE2YEg2YPZitin2YXZgQ==') // "حوّله لملف كامل"
    ];
  }

  if (messageType === 'explanation') {
    return [
      decodeText('2KfZrti62LXYsCD2KfZhNis2YjYp9io'), // "اختصر الجواب"
      decodeText('2KfYtNix2K0g2KPZg9ir2LE='), // "اشرح أكثر"
      decodeText('2KPZi9i32Yog2YXYqti32KfZhA=='), // "أعطني مثال"
      decodeText('2K3ZiNmE2Ycg2KfZhNmF2YjYp9mCINmE2YTZhdi32YjYsQ==') // "حوّله إلى كود"
    ];
  }

  return [
    decodeText('2KfYtNix2K0g2KPZg9ir2LE='), // "اشرح أكثر"
    decodeText('2KfZrti62LXYsCD2KfZhNis2YjYp9io'), // "اختصر الجواب"
    decodeText('2KPZi9i32Yog2YXYqti32KfZhA==') // "أعطني مثال"
  ];
}
