export type YesNo = 'yes' | 'no' | '';

export interface Clinician {
  clinicianName: string;
  clinicianRole:
    | 'anaesthetist'
    | 'surgeon'
    | 'preop-nurse'
    | 'perioperative-physician'
    | 'geriatrician'
    | 'pharmacist'
    | 'other'
    | '';
  registrationBody: 'GMC' | 'NMC' | 'HCPC' | 'GPhC' | 'other' | '';
  registrationNumber: string;
  siteName: string;
  assessmentDate: string;
  assessmentTime: string;
}

export interface Patient {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nhsNumber: string;
  sex: 'male' | 'female' | 'other' | '';
  weightKg: number | null;
  heightCm: number | null;
}

export interface SurgeryPlan {
  plannedProcedure: string;
  surgicalSpecialty: string;
  urgency: 'elective' | 'urgent' | 'emergency' | 'immediate' | '';
  laterality: 'left' | 'right' | 'bilateral' | 'midline' | 'na' | '';
  surgicalSeverity: 'minor' | 'intermediate' | 'major' | 'major-plus' | '';
  anticipatedBloodLossMl: number | null;
  anticipatedDurationMinutes: number | null;
  consultantSurgeon: string;
  plannedDate: string;
}

export interface Vitals {
  systolicBp: number | null;
  diastolicBp: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  spo2Percent: number | null;
  temperatureCelsius: number | null;
  capillaryRefillSeconds: number | null;
  painScore010: number | null;
  onRoomAir: YesNo;
  supplementalOxygenLitres: number | null;
}

export interface Airway {
  mallampatiClass: 'I' | 'II' | 'III' | 'IV' | '';
  thyromentalDistanceCm: number | null;
  mouthOpeningCm: number | null;
  interIncisorGapCm: number | null;
  neckRom: 'full' | 'reduced' | 'severely-limited' | '';
  cervicalSpineStability: 'stable' | 'limited' | 'unstable' | '';
  dentition: 'good' | 'loose-teeth' | 'caps-crowns' | 'edentulous' | 'dentures' | '';
  beard: YesNo;
  upperLipBiteTest: 'I' | 'II' | 'III' | '';
  priorDifficultIntubation: YesNo;
  stopbangSnoring: YesNo;
  stopbangTired: YesNo;
  stopbangObservedApnoea: YesNo;
  stopbangPressure: YesNo;
  stopbangBmiGt35: YesNo;
  stopbangAgeGt50: YesNo;
  stopbangNeckGt40: YesNo;
  stopbangMale: YesNo;
  airwayNotes: string;
}

export interface Cardiovascular {
  heartRhythm: 'sinus' | 'atrial-fibrillation' | 'flutter' | 'heart-block' | 'paced' | 'other' | '';
  murmurPresent: YesNo;
  murmurDescription: string;
  peripheralPulses: 'normal' | 'reduced' | 'absent' | '';
  jvpRaised: YesNo;
  peripheralOedema: 'none' | 'mild' | 'moderate' | 'severe' | '';
  ecgPerformed: YesNo;
  ecgRhythm: string;
  ecgRateBpm: number | null;
  ecgAxis: 'normal' | 'left' | 'right' | 'extreme' | '';
  ecgIschaemicChanges: YesNo;
  ecgNotes: string;
  echoPerformed: YesNo;
  echoEfPercent: number | null;
  echoNotes: string;
  historyIhd: YesNo;
  historyChf: YesNo;
  historyStrokeTia: YesNo;
  recentMiWithin3Months: YesNo;
  pacemakerOrIcd: YesNo;
  severeValveDysfunction: YesNo;
  activeAngina: YesNo;
}

export interface Respiratory {
  breathSounds: 'normal' | 'reduced' | 'bronchial' | 'silent' | '';
  wheeze: YesNo;
  crackles: YesNo;
  crepitations: YesNo;
  chestWallDeformity: YesNo;
  asthma: 'none' | 'controlled' | 'uncontrolled' | '';
  copd: 'none' | 'mild' | 'moderate' | 'severe' | '';
  cxrPerformed: YesNo;
  cxrFindings: string;
  pftPerformed: YesNo;
  pftFev1PercentPredicted: number | null;
  pftFev1FvcRatio: number | null;
  smokingStatus: 'never' | 'ex' | 'current' | '';
  packYears: number | null;
  covidHistory: 'never' | 'recovered' | 'recent' | 'long-covid' | '';
  daysSinceCovid: number | null;
  covidUnresolvedSymptoms: YesNo;
}

export interface Neurological {
  gcsTotal: number | null;
  gcsEye: number | null;
  gcsVerbal: number | null;
  gcsMotor: number | null;
  cognitionTool: 'AMT-4' | 'MOCA' | 'MMSE' | 'none' | '';
  cognitionScore: number | null;
  cognitiveImpairment: 'none' | 'mild' | 'moderate' | 'severe' | '';
  capacityConcern: YesNo;
  cranialNervesNotes: string;
  motorPower: 'normal' | 'reduced' | 'severely-reduced' | '';
  sensoryNotes: string;
  reflexes: 'normal' | 'hyperreflexic' | 'hyporeflexic' | 'absent' | '';
  recentStrokeTia: YesNo;
  daysSinceStrokeTia: number | null;
  seizureDisorder: YesNo;
}

export interface RenalHepatic {
  creatinineUmolL: number | null;
  egfrMlMin173m2: number | null;
  ureaMmolL: number | null;
  potassiumMmolL: number | null;
  sodiumMmolL: number | null;
  dialysisStatus: 'none' | 'peritoneal' | 'haemodialysis' | 'haemofiltration' | '';
  ckdStage: '1' | '2' | '3a' | '3b' | '4' | '5' | '';
  bilirubinUmolL: number | null;
  altUL: number | null;
  astUL: number | null;
  alpUL: number | null;
  albuminGL: number | null;
  chronicLiverDisease: 'none' | 'compensated' | 'decompensated' | '';
  childPughClass: 'A' | 'B' | 'C' | '';
}

export interface Haematology {
  hbGL: number | null;
  wcc109L: number | null;
  platelets109L: number | null;
  mcvFL: number | null;
  ferritinUgL: number | null;
  transferrinSaturationPercent: number | null;
  inr: number | null;
  apttSeconds: number | null;
  fibrinogenGL: number | null;
  onAnticoagulant: YesNo;
  anticoagulantType:
    | 'warfarin'
    | 'apixaban'
    | 'rivaroxaban'
    | 'edoxaban'
    | 'dabigatran'
    | 'lmwh'
    | 'heparin-iv'
    | 'aspirin'
    | 'clopidogrel'
    | 'ticagrelor'
    | 'none'
    | '';
  anticoagulantHoldPlan: string;
  groupAndSave: 'not-required' | 'ordered' | 'valid' | 'expired' | '';
  crossmatchUnits: number | null;
  lastTransfusionDate: string;
  anaemiaSeverity: 'none' | 'mild' | 'moderate' | 'severe' | '';
}

export interface Endocrine {
  diabetesType: 'none' | 'type-1' | 'type-2' | 'gestational' | 'other' | '';
  diabetesOnInsulin: YesNo;
  hba1cMmolMol: number | null;
  fastingGlucoseMmolL: number | null;
  randomGlucoseMmolL: number | null;
  diabetesControl: 'well-controlled' | 'suboptimal' | 'poor' | '';
  diabetesComplications: string;
  thyroidStatus: 'euthyroid' | 'hypothyroid' | 'hyperthyroid' | '';
  tshMuL: number | null;
  adrenalStatus: 'normal' | 'addisons' | 'cushings' | 'on-steroid-cover' | '';
  onLongTermSteroids: YesNo;
  steroidDoseMg: number | null;
  steroidCoverPlan: string;
}

export interface Gastrointestinal {
  abdominalExam: 'normal' | 'distended' | 'tender' | 'organomegaly' | 'other' | '';
  abdominalNotes: string;
  refluxSymptoms: 'none' | 'occasional' | 'frequent' | 'severe' | '';
  hiatusHernia: YesNo;
  previousGastricSurgery: YesNo;
  ngTube: YesNo;
  stoma: 'none' | 'colostomy' | 'ileostomy' | 'urostomy' | 'gastrostomy' | '';
  fastingConfirmed: YesNo;
  lastSolidFoodAt: string;
  lastClearFluidAt: string;
  rapidSequenceInductionNeeded: YesNo;
}

export interface Musculoskeletal {
  spineExam:
    | 'normal'
    | 'scoliosis'
    | 'kyphosis'
    | 'previous-surgery'
    | 'ankylosing-spondylitis'
    | 'other'
    | '';
  spineNotes: string;
  neuraxialSuitable: 'yes' | 'no' | 'unsure' | '';
  jointRomHip: 'full' | 'reduced' | 'severely-limited' | '';
  jointRomShoulder: 'full' | 'reduced' | 'severely-limited' | '';
  jointRomNeck: 'full' | 'reduced' | 'severely-limited' | '';
  skinIvAccess: 'good' | 'difficult' | 'very-difficult' | '';
  skinBlockSite: 'intact' | 'infected' | 'tattooed' | 'scarred' | '';
  pressureUlcerRisk: 'low' | 'moderate' | 'high' | 'very-high' | '';
}

export interface Medication {
  name: string;
  dose: string;
  route: 'oral' | 'iv' | 'im' | 'sc' | 'inhaled' | 'topical' | 'pr' | 'other' | '';
  frequency: string;
  indication: string;
  class:
    | 'anticoagulant'
    | 'antiplatelet'
    | 'antihypertensive'
    | 'ace-inhibitor'
    | 'arb'
    | 'beta-blocker'
    | 'diuretic'
    | 'insulin'
    | 'oral-hypoglycaemic'
    | 'steroid'
    | 'opioid'
    | 'benzodiazepine'
    | 'ssri'
    | 'other'
    | '';
  perioperativeAction: 'continue' | 'hold-on-day' | 'hold-n-days' | 'stop' | 'switch' | 'bridge' | '';
  perioperativeNotes: string;
  lastDoseAt: string;
}

export interface Allergy {
  allergen: string;
  category: 'drug' | 'latex' | 'food' | 'adhesive' | 'contrast' | 'environment' | 'other' | '';
  reactionType:
    | 'anaphylaxis'
    | 'rash'
    | 'urticaria'
    | 'angioedema'
    | 'gi-upset'
    | 'bronchospasm'
    | 'other'
    | '';
  reactionSeverity: 'mild' | 'moderate' | 'severe' | 'life-threatening' | '';
  reactionNotes: string;
  verified: YesNo;
}

export interface FunctionalCapacity {
  metsEstimate: number | null;
  dasiScore: number | null;
  ecogPerformanceStatus: number | null;
  clinicalFrailtyScale: number | null;
  sixMinuteWalkMetres: number | null;
  stsOneMinuteReps: number | null;
  tugSeconds: number | null;
  cpetPerformed: YesNo;
  cpetVo2PeakMlKgMin: number | null;
  cpetAnaerobicThresholdMlKgMin: number | null;
  cpetNotes: string;
  malnutritionRisk: 'none' | 'low' | 'medium' | 'high' | '';
  unintentionalWeightLossKg: number | null;
}

export interface AnaesthesiaPlan {
  technique:
    | 'ga'
    | 'regional'
    | 'neuraxial'
    | 'sedation'
    | 'mac'
    | 'local'
    | 'combined-ga-regional'
    | '';
  airwayPlan: 'face-mask' | 'supraglottic' | 'ett' | 'awake-fibreoptic' | 'surgical-airway' | '';
  rsiPlanned: YesNo;
  monitoringLevel: 'standard' | 'invasive-arterial' | 'invasive-cvc' | 'cardiac-output' | '';
  analgesiaPlan: string;
  regionalBlockPlanned: string;
  dvtProphylaxis: string;
  antibioticProphylaxis: string;
  postOpDisposition: 'day-case' | 'ward' | 'enhanced-care' | 'hdu' | 'icu' | '';
  anticipatedLengthOfStayDays: number | null;
  specialEquipment: string;
  bloodProductsRequired: string;
}

export interface Summary {
  finalAsaGrade: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | '';
  overrideReason: string;
  recommendation: 'proceed' | 'optimise-first' | 'mdt-review' | 'cancel' | '';
  clinicianNotes: string;
  signedAt: string;
}

export interface ClinicianAssessment {
  clinician: Clinician;
  patient: Patient;
  surgery: SurgeryPlan;
  vitals: Vitals;
  airway: Airway;
  cardiovascular: Cardiovascular;
  respiratory: Respiratory;
  neurological: Neurological;
  renalHepatic: RenalHepatic;
  haematology: Haematology;
  endocrine: Endocrine;
  gastrointestinal: Gastrointestinal;
  musculoskeletal: Musculoskeletal;
  medications: Medication[];
  allergies: Allergy[];
  functionalCapacity: FunctionalCapacity;
  anaesthesiaPlan: AnaesthesiaPlan;
  summary: Summary;
}

export type AsaGrade = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
export type CompositeRisk = 'low' | 'moderate' | 'high' | 'critical';
export type FlagPriority = 'low' | 'medium' | 'high';

export interface FiredRule {
  ruleId: string;
  instrument: 'asa' | 'mallampati' | 'rcri' | 'stopbang' | 'frailty';
  grade: string;
  category: string;
  description: string;
}

export interface AdditionalFlag {
  flagId: string;
  category:
    | 'difficult-airway'
    | 'severe-cardiac'
    | 'severe-respiratory'
    | 'severe-renal'
    | 'severe-hepatic'
    | 'severe-anaemia'
    | 'coagulopathy'
    | 'uncontrolled-diabetes'
    | 'severe-frailty'
    | 'recent-covid-19'
    | 'fasting-violation'
    | 'missing-crossmatch'
    | 'high-risk-medication'
    | 'capacity-concern'
    | 'paediatric'
    | 'pregnancy'
    | 'safeguarding'
    | 'malignant-hyperthermia'
    | 'latex-allergy'
    | 'sux-apnoea'
    | 'pseudocholinesterase-deficiency'
    | 'malnutrition-risk'
    | 'other';
  priority: FlagPriority;
  description: string;
  suggestedAction: string;
}

export interface GradingResult {
  computedAsaGrade: AsaGrade;
  finalAsaGrade: AsaGrade | '';
  asaEmergencySuffix: 'E' | '';
  overrideReason: string;
  mallampatiClass: 'I' | 'II' | 'III' | 'IV' | '';
  rcriScore: number;
  stopbangScore: number;
  frailtyScale: number | null;
  compositeRisk: CompositeRisk;
  firedRules: FiredRule[];
  additionalFlags: AdditionalFlag[];
}
