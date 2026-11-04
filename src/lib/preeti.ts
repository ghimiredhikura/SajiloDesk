import { preetiToUnicode } from '@lacspace/preeti';
export const TEXT_LIMIT = 50000;
export function convertPreeti(text: string) {
  if (!text.trim()) throw new Error('empty-text');
  if (text.length > TEXT_LIMIT) throw new Error('text-limit');
  // Plain text cannot identify the font of an English span. Explicit markers avoid guesses.
  const pieces = text.split(/(\[\[[\s\S]*?\]\])/g);
  return pieces.map(piece => piece.startsWith('[[') && piece.endsWith(']]') ? piece.slice(2,-2) : preetiToUnicode(piece)).join('');
}
