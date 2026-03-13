/** Detect flagged safety issues - ported from flagged-issues.ts */
export function detectFlaggedIssues(data, news2) {
  const flags = [];

  // NEWS2 >= 7
  if (news2.totalScore >= 7) {
    flags.push({
      id: 'news2-critical',
      category: 'NEWS2',
      message: 'NEWS2 score ' + news2.totalScore + ' \u2014 emergency assessment by critical care team required',
      priority: 'high'
    });
  } else if (news2.totalScore >= 5) {
    flags.push({
      id: 'news2-medium',
      category: 'NEWS2',
      message: 'NEWS2 score ' + news2.totalScore + ' \u2014 urgent review required',
      priority: 'high'
    });
  }

  // Any single NEWS2 parameter scoring 3
  if (news2.hasAnySingleScore3) {
    const params3 = news2.parameterScores.filter(p => p.score === 3).map(p => p.parameter);
    flags.push({
      id: 'news2-single-3',
      category: 'NEWS2',
      message: 'Single parameter score of 3 in: ' + params3.join(', ') + ' \u2014 urgent ward review',
      priority: 'high'
    });
  }

  // Safeguarding concerns
  if (data.safeguardingConsent.safeguardingConcern === 'yes') {
    flags.push({
      id: 'safeguarding',
      category: 'Safeguarding',
      message: 'Safeguarding concern identified: ' + (data.safeguardingConsent.safeguardingType || 'details pending'),
      priority: 'high'
    });
  }

  // Allergies with anaphylaxis
  const anaphylaxisAllergies = data.medicalHistory.allergies.filter(a => a.severity === 'anaphylaxis');
  if (anaphylaxisAllergies.length > 0) {
    flags.push({
      id: 'anaphylaxis-history',
      category: 'Allergies',
      message: 'Anaphylaxis history: ' + anaphylaxisAllergies.map(a => a.allergen).join(', '),
      priority: 'high'
    });
  }

  // Anticoagulant use
  const anticoagulants = ['warfarin', 'rivaroxaban', 'apixaban', 'edoxaban', 'dabigatran', 'heparin', 'enoxaparin'];
  const onAnticoagulant = data.medicalHistory.medications.some(m =>
    anticoagulants.some(ac => m.name.toLowerCase().includes(ac))
  );
  if (onAnticoagulant) {
    flags.push({
      id: 'anticoagulant',
      category: 'Medications',
      message: 'Patient on anticoagulant therapy \u2014 bleeding risk',
      priority: 'high'
    });
  }

  // GCS <= 8
  const gcsTotal = data.primarySurvey.disability.gcsTotal;
  if (gcsTotal !== null && gcsTotal <= 8) {
    flags.push({
      id: 'gcs-low',
      category: 'Neurological',
      message: 'GCS ' + gcsTotal + ' \u2014 unconscious patient, consider airway management',
      priority: 'high'
    });
  }

  // Abnormal pupil reactivity
  if (data.vitalSigns.pupilLeftReactive === 'no' || data.vitalSigns.pupilRightReactive === 'no') {
    flags.push({
      id: 'pupil-unreactive',
      category: 'Neurological',
      message: 'Non-reactive pupil(s) identified',
      priority: 'high'
    });
  }

  // Active haemorrhage
  if (data.primarySurvey.circulation.haemorrhage &&
      data.primarySurvey.circulation.haemorrhage.toLowerCase() !== 'none' &&
      data.primarySurvey.circulation.haemorrhage !== '') {
    flags.push({
      id: 'haemorrhage',
      category: 'Circulation',
      message: 'Active haemorrhage: ' + data.primarySurvey.circulation.haemorrhage,
      priority: 'high'
    });
  }

  // Compromised/obstructed airway
  if (data.primarySurvey.airway.status === 'compromised' || data.primarySurvey.airway.status === 'obstructed') {
    flags.push({
      id: 'airway-compromised',
      category: 'Airway',
      message: 'Airway ' + data.primarySurvey.airway.status + ' \u2014 immediate intervention required',
      priority: 'high'
    });
  }

  // Pregnancy
  if (data.investigations.pregnancyTest && data.investigations.pregnancyTest.toLowerCase() === 'positive') {
    flags.push({
      id: 'pregnancy',
      category: 'Pregnancy',
      message: 'Pregnancy test positive \u2014 consider implications for investigations and treatment',
      priority: 'medium'
    });
  }

  // Mental Health Act section
  if (data.safeguardingConsent.mentalHealthActStatus && data.safeguardingConsent.mentalHealthActStatus !== '') {
    flags.push({
      id: 'mha-section',
      category: 'Mental Health',
      message: 'Mental Health Act status: ' + data.safeguardingConsent.mentalHealthActStatus,
      priority: 'medium'
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return flags;
}
