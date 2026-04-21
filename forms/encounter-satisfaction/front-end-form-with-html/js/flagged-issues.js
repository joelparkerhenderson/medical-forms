/**
 * Detects flagged issues based on satisfaction responses.
 *
 * High priority: Any question rated 1 (Very Dissatisfied); any communication question rated <= 2
 * Medium priority: Any question rated 2 (Dissatisfied); overall mean <= 2.4 (Poor)
 * Low priority: First-time patient with fair satisfaction (mean 2.5-3.4)
 */
export function detectAdditionalFlags(data, compositeScore) {
  const flags = [];

  // ─── High priority: Any question rated 1 (Very Dissatisfied) ────
  const allScores = getAllLikertScores(data);

  for (const item of allScores) {
    if (item.score === 1) {
      flags.push({
        id: 'FLAG-VDIS-' + item.field,
        category: 'Very Dissatisfied Response',
        message: 'Patient rated "' + item.label + '" as Very Dissatisfied (1/5)',
        priority: 'high'
      });
    }
  }

  // ─── High priority: Communication questions rated <= 2 ───────────
  const commFields = [
    { field: 'listening', label: 'Provider listening' },
    { field: 'explainingCondition', label: 'Explaining condition' },
    { field: 'answeringQuestions', label: 'Answering questions' },
    { field: 'timeSpent', label: 'Time spent with patient' }
  ];

  for (const item of commFields) {
    const score = data.communication[item.field];
    if (score !== null && score <= 2 && score !== 1) {
      // Score of 1 already flagged above; flag score of 2 for communication as high
      flags.push({
        id: 'FLAG-COMM-' + item.field,
        category: 'Communication Concern',
        message: 'Patient rated "' + item.label + '" as Dissatisfied (' + score + '/5) - communication improvement needed',
        priority: 'high'
      });
    }
  }

  // ─── Medium priority: Any question rated 2 (Dissatisfied) ───────
  for (const item of allScores) {
    if (item.score === 2) {
      // Skip communication fields already flagged as high
      const isComm = commFields.some(function(c) { return c.field === item.field; });
      if (!isComm) {
        flags.push({
          id: 'FLAG-DIS-' + item.field,
          category: 'Dissatisfied Response',
          message: 'Patient rated "' + item.label + '" as Dissatisfied (2/5)',
          priority: 'medium'
        });
      }
    }
  }

  // ─── Medium priority: Overall mean <= 2.4 (Poor) ────────────────
  if (compositeScore > 0 && compositeScore <= 2.4) {
    flags.push({
      id: 'FLAG-POOR-OVERALL',
      category: 'Poor Overall Satisfaction',
      message: 'Composite satisfaction score is ' + compositeScore.toFixed(1) + '/5.0 (Poor) - review required',
      priority: 'medium'
    });
  }

  // ─── Low priority: First-time patient with fair satisfaction ────
  if (
    data.visitInformation.firstVisit === 'yes' &&
    compositeScore >= 2.5 &&
    compositeScore <= 3.4
  ) {
    flags.push({
      id: 'FLAG-FIRST-VISIT-FAIR',
      category: 'First Visit Feedback',
      message: 'First-time patient rated experience as Fair (' + compositeScore.toFixed(1) + '/5.0) - follow up to improve retention',
      priority: 'low'
    });
  }

  // Sort: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  flags.sort(function(a, b) { return priorityOrder[a.priority] - priorityOrder[b.priority]; });

  return flags;
}

function getAllLikertScores(data) {
  const scores = [];

  const sections = [
    {
      obj: data.accessScheduling,
      labels: {
        easeOfScheduling: 'Ease of scheduling',
        waitForAppointment: 'Wait for appointment',
        waitInWaitingRoom: 'Wait in waiting room'
      }
    },
    {
      obj: data.communication,
      labels: {
        listening: 'Provider listening',
        explainingCondition: 'Explaining condition',
        answeringQuestions: 'Answering questions',
        timeSpent: 'Time spent with patient'
      }
    },
    {
      obj: data.staffProfessionalism,
      labels: {
        receptionCourtesy: 'Reception staff courtesy',
        nursingCourtesy: 'Nursing staff courtesy',
        respectShown: 'Respect shown'
      }
    },
    {
      obj: data.careQuality,
      labels: {
        involvementInDecisions: 'Involvement in decisions',
        treatmentPlanExplanation: 'Treatment plan explanation',
        confidenceInCare: 'Confidence in care'
      }
    },
    {
      obj: data.environment,
      labels: {
        cleanliness: 'Cleanliness',
        waitingAreaComfort: 'Waiting area comfort',
        privacy: 'Privacy'
      }
    },
    {
      obj: data.overallSatisfaction,
      labels: {
        overallRating: 'Overall rating',
        likelyToRecommend: 'Likely to recommend',
        likelyToReturn: 'Likely to return'
      }
    }
  ];

  for (const section of sections) {
    for (const [field, label] of Object.entries(section.labels)) {
      const val = section.obj[field];
      if (typeof val === 'number' && val >= 1 && val <= 5) {
        scores.push({ field: field, label: label, score: val });
      }
    }
  }

  return scores;
}
