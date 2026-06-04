const dimensions = 1536;

function generateMockEmbedding(text) {
  const result = new Float32Array(dimensions);
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  console.log(`Text: "${text}" -> Cleaned words:`, words);

  if (words.length === 0) {
    words.push(text || 'empty');
  }

  const getWordVector = (word) => {
    let seed = 0;
    for (let i = 0; i < word.length; i++) {
      seed = (seed << 5) - seed + word.charCodeAt(i);
      seed |= 0;
    }

    const random = () => {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const vec = new Array(dimensions);
    let sumSq = 0;
    for (let i = 0; i < dimensions; i++) {
      const val = random() * 2 - 1;
      vec[i] = val;
      sumSq += val * val;
    }
    const mag = Math.sqrt(sumSq) || 1;
    return vec.map((v) => v / mag);
  };

  for (const word of words) {
    const vec = getWordVector(word);
    for (let i = 0; i < dimensions; i++) {
      result[i] += vec[i];
    }
  }

  let sumSq = 0;
  for (let i = 0; i < dimensions; i++) {
    sumSq += result[i] * result[i];
  }
  const mag = Math.sqrt(sumSq) || 1;

  const finalEmbedding = new Array(dimensions);
  for (let i = 0; i < dimensions; i++) {
    finalEmbedding[i] = result[i] / mag;
  }

  return finalEmbedding;
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

const textA = 'Can I have the phone number of SAHER SHAT?';
const textB = 'The support phone number of SAHER SHAT is +966-500-000-000 and working hours are 9am-5pm.';

const vecA = generateMockEmbedding(textA);
const vecB = generateMockEmbedding(textB);

const similarity = cosineSimilarity(vecA, vecB);
console.log('Cosine Similarity:', similarity);
