import { latinDigits } from './dates';
export const landFactors = { ropani:5476, aana:342.25, paisa:85.5625, daam:21.390625, bigha:72900, kattha:3645, dhur:182.25, sqft:1, sqm:1 / 0.09290304 } as const;
export type LandUnit = keyof typeof landFactors;
export function decimal(value: string) {
  const normalized = latinDigits(value.trim());
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) throw new Error('invalid-number');
  const number = Number(normalized);
  if (!Number.isFinite(number) || number < 0) throw new Error('invalid-number');
  return number;
}
export function toSqft(value: number, unit: LandUnit) {
  if (!Number.isFinite(value) || value < 0) throw new Error('invalid-number');
  const sqft = value * landFactors[unit];
  if (sqft > 1e12) throw new Error('land-range');
  return sqft;
}
export function compoundToSqft(values: number[], system: 'ropani' | 'bigha') {
  const units: LandUnit[] = system === 'ropani' ? ['ropani','aana','paisa','daam'] : ['bigha','kattha','dhur'];
  const maxima = system === 'ropani' ? [Infinity,16,4,4] : [Infinity,20,20];
  if (values.length !== units.length || values.some((v,i) => !Number.isFinite(v) || v < 0 || v >= maxima[i] || (i < values.length - 1 && !Number.isInteger(v)))) throw new Error('compound');
  return toSqft(values.reduce((sum,v,i) => sum + v * landFactors[units[i]], 0), 'sqft');
}
export function fromSqft(sqft: number, unit: LandUnit) { toSqft(sqft, 'sqft'); return sqft / landFactors[unit]; }
export function compoundFromSqft(sqft: number, system: 'ropani' | 'bigha') {
  toSqft(sqft, 'sqft');
  // Round the smallest unit once before decomposition, allowing carries at boundaries.
  const factors = system === 'ropani' ? [256,16,4,1] : [400,20,1];
  let smallest = Math.round(sqft / (system === 'ropani' ? landFactors.daam : landFactors.dhur) * 10000) / 10000;
  return factors.map((f,i) => { if (i === factors.length - 1) return Math.round(smallest * 10000) / 10000; const n = Math.floor((smallest + 1e-9) / f); smallest -= n * f; return n; });
}
