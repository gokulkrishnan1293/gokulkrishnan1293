/**
 * Deterministic feature-hash embeddings.
 *
 * This is REAL vector math, not a mock: text → character trigrams + word
 * unigrams → FNV-1a hashed into a 256-dim space with signed buckets →
 * L2-normalized. Cosine similarity between such vectors is a genuine
 * (if modest) semantic-overlap signal — the same family of trick as
 * Vowpal Wabbit's hashing or a random-projection bag-of-ngrams.
 *
 * Production systems described in this portfolio use learned embeddings
 * (1536-dim, transformer-based). The pipeline shape is identical; only
 * the embedding function is swapped. That is the point being demonstrated.
 */

export const DIMS = 256;

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function features(text: string): string[] {
  const norm = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = norm.split(" ").filter((w) => w.length > 1);
  const feats: string[] = [];
  for (const w of words) {
    feats.push(`w:${w}`);
    const padded = `^${w}$`;
    for (let i = 0; i < padded.length - 2; i++) feats.push(`t:${padded.slice(i, i + 3)}`);
  }
  // word bigrams give a little phrase sensitivity
  for (let i = 0; i < words.length - 1; i++) feats.push(`b:${words[i]}_${words[i + 1]}`);
  return feats;
}

export function embed(text: string): Float32Array {
  const v = new Float32Array(DIMS);
  for (const f of features(text)) {
    const h = fnv1a(f);
    const idx = h % DIMS;
    const sign = (h >>> 16) & 1 ? 1 : -1;
    // word features weighted above trigrams: they carry more meaning
    const w = f[0] === "w" ? 2.0 : f[0] === "b" ? 1.5 : 1.0;
    v[idx] += sign * w;
  }
  let norm = 0;
  for (let i = 0; i < DIMS; i++) norm += v[i] * v[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < DIMS; i++) v[i] /= norm;
  return v;
}

export function cosine(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < DIMS; i++) s += a[i] * b[i];
  return s;
}
