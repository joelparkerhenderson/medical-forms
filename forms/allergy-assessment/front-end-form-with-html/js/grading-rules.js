/**
 * Declarative allergy severity classification rules.
 * Each rule evaluates patient data and returns true if the condition is present.
 * The severity level is determined by the highest-severity rule that fires.
 * Mild is the default when no rules fire (no significant allergic conditions).
 */
export const allergyRules = [
  // ─── ANAPHYLAXIS INDICATORS (SEVERE) ────────────────────────
  {
    id: 'AN-001',
    category: 'Anaphylaxis',
    description: 'History of anaphylaxis',
    severityLevel: 'severe',
    evaluate: (d) => d.anaphylaxisHistory.hasAnaphylaxisHistory === 'yes'
  },
  {
    id: 'AN-002',
    category: 'Anaphylaxis',
    description: 'Multiple anaphylaxis episodes (>=2)',
    severityLevel: 'severe',
    evaluate: (d) =>
      d.anaphylaxisHistory.hasAnaphylaxisHistory === 'yes' &&
      d.anaphylaxisHistory.numberOfEpisodes !== null &&
      d.anaphylaxisHistory.numberOfEpisodes >= 2
  },
  {
    id: 'AN-003',
    category: 'Anaphylaxis',
    description: 'Drug allergy with anaphylaxis history',
    severityLevel: 'severe',
    evaluate: (d) =>
      d.drugAllergies.drugAllergies.some((a) => a.severity === 'anaphylaxis')
  },
  {
    id: 'AN-004',
    category: 'Anaphylaxis',
    description: 'Food allergy with anaphylaxis history',
    severityLevel: 'severe',
    evaluate: (d) =>
      d.foodAllergies.foodAllergies.some((a) => a.severity === 'anaphylaxis')
  },
  {
    id: 'AN-005',
    category: 'Anaphylaxis',
    description: 'Insect sting allergy with anaphylaxis',
    severityLevel: 'severe',
    evaluate: (d) =>
      d.environmentalAllergies.insectStingAllergy === 'yes' &&
      d.environmentalAllergies.insectStingSeverity === 'anaphylaxis'
  },

  // ─── DRUG ALLERGY SEVERITY ──────────────────────────────────
  {
    id: 'DA-001',
    category: 'Drug Allergy',
    description: 'Severe drug allergy reaction',
    severityLevel: 'severe',
    evaluate: (d) =>
      d.drugAllergies.drugAllergies.some((a) => a.severity === 'severe')
  },
  {
    id: 'DA-002',
    category: 'Drug Allergy',
    description: 'Multiple drug allergies (>=3)',
    severityLevel: 'moderate',
    evaluate: (d) =>
      d.drugAllergies.drugAllergies.filter((a) => a.allergen).length >= 3
  },
  {
    id: 'DA-003',
    category: 'Drug Allergy',
    description: 'Drug allergy with cross-reactivity concerns',
    severityLevel: 'moderate',
    evaluate: (d) =>
      d.drugAllergies.hasDrugAllergies === 'yes' &&
      d.drugAllergies.crossReactivityConcerns !== ''
  },
  {
    id: 'DA-004',
    category: 'Drug Allergy',
    description: 'Moderate drug allergy reaction',
    severityLevel: 'moderate',
    evaluate: (d) =>
      d.drugAllergies.drugAllergies.some((a) => a.severity === 'moderate')
  },
  {
    id: 'DA-005',
    category: 'Drug Allergy',
    description: 'Mild drug allergy reaction',
    severityLevel: 'mild',
    evaluate: (d) =>
      d.drugAllergies.drugAllergies.some((a) => a.severity === 'mild')
  },

  // ─── FOOD ALLERGY SEVERITY ──────────────────────────────────
  {
    id: 'FA-001',
    category: 'Food Allergy',
    description: 'Severe food allergy reaction',
    severityLevel: 'severe',
    evaluate: (d) =>
      d.foodAllergies.foodAllergies.some((a) => a.severity === 'severe')
  },
  {
    id: 'FA-002',
    category: 'Food Allergy',
    description: 'Multiple food allergies (>=3)',
    severityLevel: 'moderate',
    evaluate: (d) =>
      d.foodAllergies.foodAllergies.filter((a) => a.allergen).length >= 3
  },
  {
    id: 'FA-003',
    category: 'Food Allergy',
    description: 'Moderate food allergy reaction',
    severityLevel: 'moderate',
    evaluate: (d) =>
      d.foodAllergies.foodAllergies.some((a) => a.severity === 'moderate')
  },
  {
    id: 'FA-004',
    category: 'Food Allergy',
    description: 'IgE-mediated food allergy',
    severityLevel: 'moderate',
    evaluate: (d) =>
      d.foodAllergies.igeType === 'IgE-mediated'
  },

  // ─── ENVIRONMENTAL ALLERGY SEVERITY ─────────────────────────
  {
    id: 'EA-001',
    category: 'Environmental',
    description: 'Latex allergy',
    severityLevel: 'moderate',
    evaluate: (d) => d.environmentalAllergies.latexAllergy === 'yes'
  },
  {
    id: 'EA-002',
    category: 'Environmental',
    description: 'Multiple environmental allergies (>=4)',
    severityLevel: 'moderate',
    evaluate: (d) => {
      let count = 0;
      if (d.environmentalAllergies.pollenAllergy === 'yes') count++;
      if (d.environmentalAllergies.dustMiteAllergy === 'yes') count++;
      if (d.environmentalAllergies.mouldAllergy === 'yes') count++;
      if (d.environmentalAllergies.animalDanderAllergy === 'yes') count++;
      if (d.environmentalAllergies.latexAllergy === 'yes') count++;
      if (d.environmentalAllergies.insectStingAllergy === 'yes') count++;
      return count >= 4;
    }
  },
  {
    id: 'EA-003',
    category: 'Environmental',
    description: 'Severe insect sting allergy',
    severityLevel: 'severe',
    evaluate: (d) =>
      d.environmentalAllergies.insectStingAllergy === 'yes' &&
      d.environmentalAllergies.insectStingSeverity === 'severe'
  },
  {
    id: 'EA-004',
    category: 'Environmental',
    description: 'Pollen allergy',
    severityLevel: 'mild',
    evaluate: (d) => d.environmentalAllergies.pollenAllergy === 'yes'
  },
  {
    id: 'EA-005',
    category: 'Environmental',
    description: 'Dust mite allergy',
    severityLevel: 'mild',
    evaluate: (d) => d.environmentalAllergies.dustMiteAllergy === 'yes'
  },

  // ─── COMORBIDITY INDICATORS ─────────────────────────────────
  {
    id: 'CM-001',
    category: 'Comorbidity',
    description: 'Asthma comorbidity with allergies',
    severityLevel: 'moderate',
    evaluate: (d) => d.comorbidities.asthma === 'yes'
  },
  {
    id: 'CM-002',
    category: 'Comorbidity',
    description: 'Severe asthma comorbidity',
    severityLevel: 'severe',
    evaluate: (d) =>
      d.comorbidities.asthma === 'yes' && d.comorbidities.asthmaSeverity === 'severe'
  },
  {
    id: 'CM-003',
    category: 'Comorbidity',
    description: 'Mast cell disorder',
    severityLevel: 'severe',
    evaluate: (d) => d.comorbidities.mastCellDisorders === 'yes'
  },
  {
    id: 'CM-004',
    category: 'Comorbidity',
    description: 'Eosinophilic oesophagitis',
    severityLevel: 'moderate',
    evaluate: (d) => d.comorbidities.eosinophilicOesophagitis === 'yes'
  },

  // ─── HIGH BURDEN INDICATORS ─────────────────────────────────
  {
    id: 'HB-001',
    category: 'Allergy Burden',
    description: 'High total allergen count (>=6)',
    severityLevel: 'moderate',
    evaluate: (d) => {
      let count = 0;
      count += d.drugAllergies.drugAllergies.filter((a) => a.allergen).length;
      count += d.foodAllergies.foodAllergies.filter((a) => a.allergen).length;
      if (d.environmentalAllergies.pollenAllergy === 'yes') count++;
      if (d.environmentalAllergies.dustMiteAllergy === 'yes') count++;
      if (d.environmentalAllergies.mouldAllergy === 'yes') count++;
      if (d.environmentalAllergies.animalDanderAllergy === 'yes') count++;
      if (d.environmentalAllergies.latexAllergy === 'yes') count++;
      if (d.environmentalAllergies.insectStingAllergy === 'yes') count++;
      return count >= 6;
    }
  },

  // ─── MANAGEMENT GAPS ────────────────────────────────────────
  {
    id: 'MG-001',
    category: 'Management',
    description: 'Anaphylaxis history without auto-injector',
    severityLevel: 'severe',
    evaluate: (d) =>
      d.anaphylaxisHistory.hasAnaphylaxisHistory === 'yes' &&
      d.anaphylaxisHistory.adrenalineAutoInjectorPrescribed === 'no'
  },
];
