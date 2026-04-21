export interface StepDef {
  number: number;
  slug: string;
  title: string;
  short: string;
}

export const STEPS: StepDef[] = [
  { number: 1, slug: 'clinician', title: 'Clinician identification', short: 'Clinician' },
  { number: 2, slug: 'patient', title: 'Patient and planned procedure', short: 'Patient' },
  { number: 3, slug: 'vitals', title: 'Vital signs and anthropometrics', short: 'Vitals' },
  { number: 4, slug: 'airway', title: 'Airway assessment', short: 'Airway' },
  { number: 5, slug: 'cardiovascular', title: 'Cardiovascular', short: 'Cardio' },
  { number: 6, slug: 'respiratory', title: 'Respiratory', short: 'Resp' },
  { number: 7, slug: 'neurological', title: 'Neurological', short: 'Neuro' },
  { number: 8, slug: 'renal-hepatic', title: 'Renal and hepatic', short: 'Renal/hepatic' },
  { number: 9, slug: 'haematology', title: 'Haematology and coagulation', short: 'Haem' },
  { number: 10, slug: 'endocrine', title: 'Endocrine', short: 'Endo' },
  { number: 11, slug: 'gastrointestinal', title: 'Gastrointestinal', short: 'GI' },
  { number: 12, slug: 'musculoskeletal', title: 'Musculoskeletal and skin', short: 'MSK/skin' },
  { number: 13, slug: 'medications', title: 'Medications and allergies', short: 'Meds' },
  { number: 14, slug: 'functional', title: 'Functional capacity and frailty', short: 'Func' },
  { number: 15, slug: 'plan', title: 'Anaesthesia and post-op plan', short: 'Plan' },
  { number: 16, slug: 'summary', title: 'Summary, ASA grade and sign-off', short: 'Sign-off' },
];

export const TOTAL_STEPS = STEPS.length;
