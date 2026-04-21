/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of the severity classification. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data) {
  const flags = [];

  // ─── Anaphylaxis history (HIGH) ─────────────────────────────
  if (data.anaphylaxisHistory.hasAnaphylaxisHistory === 'yes') {
    const count = data.anaphylaxisHistory.numberOfEpisodes || 0;
    flags.push({
      id: 'FLAG-ANAPH-001',
      category: 'Anaphylaxis',
      message: 'History of anaphylaxis (' + count + ' episode' + (count !== 1 ? 's' : '') + ')',
      priority: 'high'
    });
  }

  // ─── No adrenaline auto-injector when indicated (HIGH CRITICAL) ──
  if (
    data.anaphylaxisHistory.hasAnaphylaxisHistory === 'yes' &&
    data.anaphylaxisHistory.adrenalineAutoInjectorPrescribed === 'no'
  ) {
    flags.push({
      id: 'FLAG-ANAPH-002',
      category: 'Anaphylaxis',
      message: 'CRITICAL: Anaphylaxis history but NO adrenaline auto-injector prescribed',
      priority: 'high'
    });
  }

  // ─── Drug allergy to common anaesthetics (HIGH) ─────────────
  const commonAnaesthetics = [
    'penicillin', 'amoxicillin', 'cephalosporin', 'nsaid', 'ibuprofen',
    'aspirin', 'codeine', 'morphine', 'lidocaine', 'latex', 'suxamethonium',
    'propofol', 'thiopental', 'atracurium', 'rocuronium'
  ];
  for (let i = 0; i < data.drugAllergies.drugAllergies.length; i++) {
    const allergy = data.drugAllergies.drugAllergies[i];
    if (
      allergy.allergen &&
      commonAnaesthetics.some((a) => allergy.allergen.toLowerCase().includes(a))
    ) {
      flags.push({
        id: 'FLAG-DRUG-' + i,
        category: 'Drug Allergy',
        message: 'Drug allergy: ' + allergy.allergen + ' (' + (allergy.severity || 'severity unspecified') + ') - commonly used drug',
        priority: 'high'
      });
    }
  }

  // ─── Anaphylaxis-severity drug allergies ────────────────────
  for (let i = 0; i < data.drugAllergies.drugAllergies.length; i++) {
    const allergy = data.drugAllergies.drugAllergies[i];
    if (allergy.severity === 'anaphylaxis') {
      flags.push({
        id: 'FLAG-DRUG-ANAPH-' + i,
        category: 'Drug Allergy',
        message: 'ANAPHYLAXIS history to drug: ' + allergy.allergen,
        priority: 'high'
      });
    }
  }

  // ─── Latex allergy (HIGH) ───────────────────────────────────
  if (data.environmentalAllergies.latexAllergy === 'yes') {
    flags.push({
      id: 'FLAG-LATEX-001',
      category: 'Environmental',
      message: 'Latex allergy - ensure latex-free environment for all procedures',
      priority: 'high'
    });
  }

  // ─── Multiple food allergies (MEDIUM) ───────────────────────
  const foodAllergyCount = data.foodAllergies.foodAllergies.filter((a) => a.allergen).length;
  if (foodAllergyCount >= 3) {
    flags.push({
      id: 'FLAG-FOOD-001',
      category: 'Food Allergy',
      message: 'Multiple food allergies (' + foodAllergyCount + ') - nutritional review may be needed',
      priority: 'medium'
    });
  }

  // ─── Anaphylaxis-severity food allergies ────────────────────
  for (let i = 0; i < data.foodAllergies.foodAllergies.length; i++) {
    const allergy = data.foodAllergies.foodAllergies[i];
    if (allergy.severity === 'anaphylaxis') {
      flags.push({
        id: 'FLAG-FOOD-ANAPH-' + i,
        category: 'Food Allergy',
        message: 'ANAPHYLAXIS history to food: ' + allergy.allergen,
        priority: 'high'
      });
    }
  }

  // ─── No action plan (MEDIUM) ────────────────────────────────
  if (
    data.anaphylaxisHistory.hasAnaphylaxisHistory === 'yes' &&
    data.anaphylaxisHistory.actionPlanInPlace !== 'yes'
  ) {
    flags.push({
      id: 'FLAG-PLAN-001',
      category: 'Action Plan',
      message: 'Anaphylaxis history but no action plan in place',
      priority: 'medium'
    });
  }

  if (data.impactActionPlan.emergencyActionPlanStatus === 'not-in-place') {
    flags.push({
      id: 'FLAG-PLAN-002',
      category: 'Action Plan',
      message: 'Emergency action plan is not in place',
      priority: 'medium'
    });
  }

  if (data.impactActionPlan.emergencyActionPlanStatus === 'needs-update') {
    flags.push({
      id: 'FLAG-PLAN-003',
      category: 'Action Plan',
      message: 'Emergency action plan needs updating',
      priority: 'medium'
    });
  }

  // ─── Asthma comorbidity (MEDIUM) ────────────────────────────
  if (data.comorbidities.asthma === 'yes') {
    flags.push({
      id: 'FLAG-ASTHMA-001',
      category: 'Comorbidity',
      message: 'Asthma comorbidity (' + (data.comorbidities.asthmaSeverity || 'severity unspecified') + ') - increased anaphylaxis risk',
      priority: 'medium'
    });
  }

  // ─── Mast cell disorder (HIGH) ──────────────────────────────
  if (data.comorbidities.mastCellDisorders === 'yes') {
    flags.push({
      id: 'FLAG-MAST-001',
      category: 'Comorbidity',
      message: 'Mast cell disorder - heightened risk of severe allergic reactions',
      priority: 'high'
    });
  }

  // ─── Insect sting allergy with severe/anaphylaxis ───────────
  if (
    data.environmentalAllergies.insectStingAllergy === 'yes' &&
    (data.environmentalAllergies.insectStingSeverity === 'severe' ||
      data.environmentalAllergies.insectStingSeverity === 'anaphylaxis')
  ) {
    flags.push({
      id: 'FLAG-INSECT-001',
      category: 'Environmental',
      message: 'Severe insect sting allergy (' + data.environmentalAllergies.insectStingSeverity + ') - venom immunotherapy may be indicated',
      priority: 'high'
    });
  }

  // ─── Mental health impact ───────────────────────────────────
  if (data.comorbidities.mentalHealthImpact === 'yes') {
    flags.push({
      id: 'FLAG-MENTAL-001',
      category: 'Quality of Life',
      message: 'Mental health impact reported - psychological support may be needed',
      priority: 'medium'
    });
  }

  // ─── Quality of life severely impacted ──────────────────────
  if (
    data.impactActionPlan.qualityOfLifeScore !== null &&
    data.impactActionPlan.qualityOfLifeScore <= 3
  ) {
    flags.push({
      id: 'FLAG-QOL-001',
      category: 'Quality of Life',
      message: 'Very low quality of life score (' + data.impactActionPlan.qualityOfLifeScore + '/10)',
      priority: 'medium'
    });
  }

  // Sort: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return flags;
}
