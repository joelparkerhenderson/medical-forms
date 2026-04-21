import { validationRules } from './validation-rules.js';
import { validationStatus } from './utils.js';

/**
 * Pure function: validates the Medical Records Release Permission form data.
 * Returns a completeness score (0-100), status labels, and fired rules
 * for each incomplete or invalid field.
 */
export function validateForm(data) {
  const firedRules = [];
  const totalFields = validationRules.length;
  let completedFields = 0;

  const yesRequiredFields = [
    'acknowledgedRightToRevoke',
    'acknowledgedDataProtection',
    'acknowledgedNoChargeForAccess',
    'patientSignatureConfirmed',
    'witnessSignatureConfirmed'
  ];

  for (const rule of validationRules) {
    const section = data[rule.section];
    const value = section[rule.field];

    let isComplete = false;

    if (Array.isArray(value)) {
      isComplete = value.length > 0;
    } else if (typeof value === 'string') {
      if (yesRequiredFields.includes(rule.field)) {
        isComplete = value === 'yes';
      } else {
        isComplete = value.trim() !== '';
      }
    } else {
      isComplete = value !== null && value !== undefined;
    }

    if (isComplete) {
      completedFields++;
    } else {
      firedRules.push({
        id: rule.id,
        domain: rule.section,
        description: rule.description,
        score: 0
      });
    }
  }

  // Email format validation
  if (data.patientInformation.email && !isValidEmail(data.patientInformation.email)) {
    firedRules.push({
      id: 'RULE-FMT-001',
      domain: 'patientInformation',
      description: 'Patient email format is invalid',
      score: 0
    });
  }

  if (data.authorizedRecipient.recipientEmail && !isValidEmail(data.authorizedRecipient.recipientEmail)) {
    firedRules.push({
      id: 'RULE-FMT-002',
      domain: 'authorizedRecipient',
      description: 'Recipient email format is invalid',
      score: 0
    });
  }

  // Date validation: end date must be after start date
  if (data.authorizationPeriod.startDate && data.authorizationPeriod.endDate) {
    if (data.authorizationPeriod.endDate < data.authorizationPeriod.startDate) {
      firedRules.push({
        id: 'RULE-FMT-003',
        domain: 'authorizationPeriod',
        description: 'Authorization end date must be after start date',
        score: 0
      });
    }
  }

  // Date range validation for records
  if (data.recordsToRelease.specificDateRange === 'yes') {
    if (!data.recordsToRelease.dateFrom) {
      firedRules.push({
        id: 'RULE-FMT-004',
        domain: 'recordsToRelease',
        description: 'Record date range "from" date is required when specific date range is selected',
        score: 0
      });
    }
    if (!data.recordsToRelease.dateTo) {
      firedRules.push({
        id: 'RULE-FMT-005',
        domain: 'recordsToRelease',
        description: 'Record date range "to" date is required when specific date range is selected',
        score: 0
      });
    }
  }

  // Purpose "other" requires details
  if (data.purposeOfRelease.purpose === 'other' && !(data.purposeOfRelease.otherDetails || '').trim()) {
    firedRules.push({
      id: 'RULE-FMT-006',
      domain: 'purposeOfRelease',
      description: 'Details are required when purpose is "Other"',
      score: 0
    });
  }

  const score = totalFields === 0 ? 100 : Math.round((completedFields / totalFields) * 100);
  const status = completenessStatus(score);
  const valStatus = validationStatus(firedRules.length);

  return {
    completenessScore: score,
    completenessStatus: status,
    validationStatusLabel: valStatus,
    firedRules
  };
}

function completenessStatus(score) {
  if (score === 100) return 'Complete';
  if (score >= 75) return 'Nearly Complete';
  if (score >= 50) return 'Partially Complete';
  return 'Incomplete';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
