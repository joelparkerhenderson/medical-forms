import type { ClinicianAssessment, AsaGrade } from './types.js';

const ASA_ORDER: AsaGrade[] = ['I', 'II', 'III', 'IV', 'V', 'VI'];

export function maxAsa(a: AsaGrade, b: AsaGrade): AsaGrade {
  return ASA_ORDER.indexOf(a) >= ASA_ORDER.indexOf(b) ? a : b;
}

export function computeBmi(weightKg: number | null, heightCm: number | null): number | null {
  if (weightKg === null || heightCm === null || heightCm <= 0) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function ageFromDob(dob: string, referenceDate: string): number | null {
  if (!dob || !referenceDate) return null;
  const birth = new Date(dob);
  const ref = new Date(referenceDate);
  if (Number.isNaN(birth.valueOf()) || Number.isNaN(ref.valueOf())) return null;
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function isHighRiskSurgery(
  severity: ClinicianAssessment['surgery']['surgicalSeverity'],
): boolean {
  return severity === 'major' || severity === 'major-plus';
}
