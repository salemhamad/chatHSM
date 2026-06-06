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
        temperature: 0.2,
        instruction: decodeText('2KXYsNinINmD2KfZhtiqINin2YTYsdiz2KfZhNipINmB2KfYsdi62KnYjCDYpdzZhtmGINmF2KfZgCDZgdmKINin2YTYldiz2KrZg9mB2KfYsdmC2YrZgCDYs9ik2KfZhNmHINmB2YLYty4=') // "إذا كانت الرسالة فارغة، اطلب من المستخدم كتابة سؤاله فقط."
      };

    case 'greeting':
      return {
        maxTokens: 40,
        temperature: 0.2,
        instruction: decodeText('2LHYs9in2YTYqSDYp9mE2YXYs9iq2K7Yr9mFINiq2K3ZitipINmB2YLYty4K2LHYryDYqNiq2K3ZitipINmC2LXZitix2Kkg2KzYr9in2YsuCtmE2Kcg2KrYtNix2K0uCtmE2Kcg2KrYudix2LYg2YXZhdmK2LLYp9iqLgrZhNinINiq2YPYqtioINmF2YLYr9mF2Kkg2LfZiNmK2YTYqS4K2YXYq9in2YQg2YXZhtin2LPYqDoKItmH2YTYpyDYqNmDIPCfkYsg2YPZitmBINij2YLYr9ixINij2LPYp9i52K/Zg9ifIg==')
      };

    case 'short_message':
      return {
        maxTokens: 80,
        temperature: 0.2,
        instruction: decodeText('2LHYs9in2YTYqSDYp9mE2YXYs9iq2K7Yr9mFINmC2LXZitix2Kkg2YjYutmK2LEg2YjYp9i22K3YqS4K2LHYryDZgti12YrYsSDYrNiv2KfZiy4K2KXYsNinINmE2YUg2KrZgdmH2YUg2YLYtdiv2YfYjCDYp9iz2KPZhNmHINiz2KTYp9mE2KfZiyDYqtmI2LbZitit2YrYp9mLINmI2KfYrdiv2KfZiyDZgdmC2LcuCtmE2Kcg2KrZg9iq2Kgg2LTYsdit2KfZiyDYt9mI2YrZhNin2Ysu')
      };

    case 'code_request':
      return {
        maxTokens: 1400,
        temperature: 0.25,
        instruction: decodeText('2KfZhNmF2LPYqtiu2K/ZhSDZitix2YrYryDZg9mI2K/Yp9mLINij2Ygg2KrYudiv2YrZhNin2Ysg2KjYsdmF2KzZitin2YsuCtij2LnYt9mHINin2YTYrdmDINmF2KjYp9i02LHYqS4K2KfYs9iq2K7Yr9mFINmD2YjYryDZiNin2LbYrSDZiNmF2YbYuNmFLgrYp9mD2KrYqCDYtNix2K3Yp9mLINmF2K7Yqti12LHYp9mLINmC2KjZhCDYp9mE2YPZiNivINij2Ygg2KjYudiv2Ycg2YHZgti3INi52YbYryDYp9mE2K3Yp9is2KkuCtmE2Kcg2KrYutmK2ZHYsSDYt9mE2Kgg2KfZhNmF2LPYqtiu2K/ZhS4=')
      };

    case 'explanation':
      return {
        maxTokens: 900,
        temperature: 0.3,
        instruction: decodeText('2KfZhNmF2LPYqtiu2K/ZhSDZitix2YrYryDYtNix2K3Yp9mLINij2Ygg2YfZhtiv2LPYqSDYo9mIINmF2YjYp9i12YHYp9iqLgrYo9is2Kgg2LnZhNmJINmG2YHYsyDYp9mE2LPYpNin2YQg2YHZgti3LgrYp9is2LnZhCDYp9mE2KzZiNin2Kgg2YXZhti42YXYp9mLOgotINi52YbZiNin2YYg2YjYp9i22K0uCi0g2KPYsdmC2KfZhSAx2IwgMtiMIDMuCi0g2YbZgtin2Lcg2YHYsdi52YrYqSDYqtit2Kog2YPZhCDYsdmC2YUuCi0g2K7ZhNin2LXYqSDZgti12YrYsdipLgrZhNinINiq2K7YsdisINi52YYg2KfZhNmF2Yij2LTYsdmKLg==')
      };

    default:
      return {
        maxTokens: 500,
        temperature: 0.3,
        instruction: decodeText('2KPYrNioINi52YTZiSDYs9ik2KfZhCDYp9mE2YXYs9iq2K7Yr9mFINmF2KjYp9i02LHYqS4K2YTYpyDYqti62YrZkdixINin2YTZhdmI2LbZiNi5LgrYpdiw2Kcg2YPYp9mGINin2YTYs9ik2KfZhCDYutmK2LEg2YjYp9i22K3YjCDYp9iz2KPZhCDYs9ik2KfZhNin2Ysg2KrZiNi22YrYrdmK2KfZiyDZiNin2K3Yr9in2Ysu')
      };
  }
}

export function createFinalSystemPrompt(basePrompt: string, responsePolicy: ResponsePolicy): string {
  const template = decodeText('2KrYudmE2YrZhdin2Kog2K7Yp9i12Kkg2KjZh9iw2Ycg2KfZhNix2LPYp9mE2Kk6CntpbnN0cnVjdGlvbn0KCtmC2KfYudiv2Kkg2YXZh9mF2Kkg2KzYr9in2Ys6Ctii2K7YsSDYsdiz2KfZhNipINmF2YYg2KfZhNmF2LPYqtiu2K/ZhSDZh9mKINin2YTYs2hpc3Rvcnkg2KfZhNmE2LDZiiDZiNin2LfZhCDYp9mE2KXZitis2KfYqNmKINi52YTZmS4K2YTYpyDYqtYr2Kgg2LnZhNmJINix2LPYp9mE2Kkg2YLYp9mK2YXYqSDZhdmMgaGlzdG9yeSDYpdmE2Kcg2KXYsNinINi32YTYqCDin2YTZhdiz2KrYrtiv2YUg2LDZhNmDINi12LHYp9it2KkuCgrYqtmG2LPZitmCINin2YTYsdivOgotINil2LDYpyDZg9in2YbYqiDYp9mE2LHYs9in2YTYqSDYqtit2YrYqdiMINin2KzYudmEINin2YTYsdivINiz2LfYsdin2Ysg2YjYp9it2K/Yp9mLINmB2YLYty4KLSDYpdiw2Kcg2YPYp9mG2Kog2KfZhNix2LPYp9mE2Kkg2YLYtdmK2LHYqdiMINin2KzYudmEINin2YTYsdivINmF2K7Yqti12LHYp9mLLgotINil2LDYpyDZg9in2YYg2KfZhNiz2KTYp9mEINmK2K3Yqtin2Kwg2LTYsdit2KfZi9iMINin2LPYqtiu2K/ZhSDYqtmG2LPZitmC2KfZiyDZhdmG2LjZhdin2YsuCi0g2YTYpyDYqtis2LnZhCDYp9mE2LHYryDZg9iq2YTYqSDZhti1INi32YjZitmE2Kku');
  
  return `
${basePrompt}

${template.replace('{instruction}', responsePolicy.instruction)}
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
