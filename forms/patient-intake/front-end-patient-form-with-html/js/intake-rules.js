export const intakeRules = [
    // MEDICAL HISTORY
    { id: 'MH-001', category: 'Medical History', description: 'Multiple chronic conditions (3+)', riskLevel: 'high',
      evaluate: (d) => d.medicalHistory.chronicConditions.length >= 3 },
    { id: 'MH-002', category: 'Medical History', description: 'One or two chronic conditions', riskLevel: 'medium',
      evaluate: (d) => d.medicalHistory.chronicConditions.length >= 1 && d.medicalHistory.chronicConditions.length < 3 },
    { id: 'MH-003', category: 'Medical History', description: 'Previous surgeries reported', riskLevel: 'medium',
      evaluate: (d) => d.medicalHistory.previousSurgeries.trim() !== '' },
    { id: 'MH-004', category: 'Medical History', description: 'Previous hospitalizations reported', riskLevel: 'medium',
      evaluate: (d) => d.medicalHistory.previousHospitalizations.trim() !== '' },
    { id: 'MH-005', category: 'Medical History', description: 'Ongoing treatments reported', riskLevel: 'medium',
      evaluate: (d) => d.medicalHistory.ongoingTreatments.trim() !== '' },
    // MEDICATIONS
    { id: 'RX-001', category: 'Medications', description: 'Polypharmacy (5+ medications)', riskLevel: 'high',
      evaluate: (d) => d.medications.length >= 5 },
    { id: 'RX-002', category: 'Medications', description: 'Multiple medications (2-4)', riskLevel: 'medium',
      evaluate: (d) => d.medications.length >= 2 && d.medications.length < 5 },
    // ALLERGIES
    { id: 'AL-001', category: 'Allergies', description: 'Anaphylaxis history', riskLevel: 'high',
      evaluate: (d) => d.allergies.some(a => a.severity === 'anaphylaxis') },
    { id: 'AL-002', category: 'Allergies', description: 'Multiple allergies (3+)', riskLevel: 'high',
      evaluate: (d) => d.allergies.length >= 3 },
    { id: 'AL-003', category: 'Allergies', description: 'Latex allergy', riskLevel: 'medium',
      evaluate: (d) => d.allergies.some(a => a.allergyType === 'latex') },
    { id: 'AL-004', category: 'Allergies', description: 'Drug allergy present', riskLevel: 'medium',
      evaluate: (d) => d.allergies.some(a => a.allergyType === 'drug') },
    // FAMILY HISTORY
    { id: 'FH-001', category: 'Family History', description: 'Multiple family conditions (3+)', riskLevel: 'medium',
      evaluate: (d) => {
          let count = 0;
          if (d.familyHistory.heartDisease === 'yes') count++;
          if (d.familyHistory.cancer === 'yes') count++;
          if (d.familyHistory.diabetes === 'yes') count++;
          if (d.familyHistory.stroke === 'yes') count++;
          if (d.familyHistory.mentalIllness === 'yes') count++;
          if (d.familyHistory.geneticConditions === 'yes') count++;
          return count >= 3;
      } },
    { id: 'FH-002', category: 'Family History', description: 'Genetic conditions in family', riskLevel: 'medium',
      evaluate: (d) => d.familyHistory.geneticConditions === 'yes' },
    // SOCIAL HISTORY
    { id: 'SH-001', category: 'Social History', description: 'Current smoker', riskLevel: 'medium',
      evaluate: (d) => d.socialHistory.smokingStatus === 'current' },
    { id: 'SH-002', category: 'Social History', description: 'Heavy alcohol use', riskLevel: 'medium',
      evaluate: (d) => d.socialHistory.alcoholFrequency === 'heavy' },
    { id: 'SH-003', category: 'Social History', description: 'Regular drug use', riskLevel: 'high',
      evaluate: (d) => d.socialHistory.drugUse === 'regular' },
    // REVIEW OF SYSTEMS
    { id: 'ROS-001', category: 'Review of Systems', description: 'Cardiovascular symptoms reported', riskLevel: 'medium',
      evaluate: (d) => d.reviewOfSystems.cardiovascular.trim() !== '' },
    { id: 'ROS-002', category: 'Review of Systems', description: 'Neurological symptoms reported', riskLevel: 'medium',
      evaluate: (d) => d.reviewOfSystems.neurological.trim() !== '' },
    { id: 'ROS-003', category: 'Review of Systems', description: 'Psychiatric symptoms reported', riskLevel: 'medium',
      evaluate: (d) => d.reviewOfSystems.psychiatric.trim() !== '' },
    // URGENCY
    { id: 'UR-001', category: 'Urgency', description: 'Emergency visit', riskLevel: 'high',
      evaluate: (d) => d.reasonForVisit.urgencyLevel === 'emergency' },
    { id: 'UR-002', category: 'Urgency', description: 'Urgent visit', riskLevel: 'medium',
      evaluate: (d) => d.reasonForVisit.urgencyLevel === 'urgent' },
    // CONSENT
    { id: 'CN-001', category: 'Consent', description: 'Consent to treatment not given', riskLevel: 'high',
      evaluate: (d) => d.consentAndPreferences.consentToTreatment === 'no' },
    { id: 'CN-002', category: 'Consent', description: 'Privacy acknowledgement not given', riskLevel: 'medium',
      evaluate: (d) => d.consentAndPreferences.privacyAcknowledgement === 'no' },
];
