/**
 * 19 satisfaction questions across 6 domains.
 * Each scored on a 5-point Likert scale (1=Very Dissatisfied ... 5=Very Satisfied).
 */
export const satisfactionQuestions = [
  // Access & Scheduling (3)
  { id: 'ESS-01', domain: 'Access & Scheduling', section: 'accessScheduling', field: 'easeOfScheduling', text: 'How satisfied were you with the ease of scheduling your appointment?' },
  { id: 'ESS-02', domain: 'Access & Scheduling', section: 'accessScheduling', field: 'waitForAppointment', text: 'How satisfied were you with the time you waited to get an appointment?' },
  { id: 'ESS-03', domain: 'Access & Scheduling', section: 'accessScheduling', field: 'waitInWaitingRoom', text: 'How satisfied were you with the time you waited in the waiting room?' },

  // Communication (4)
  { id: 'ESS-04', domain: 'Communication', section: 'communication', field: 'listening', text: 'How satisfied were you with how well the provider listened to you?' },
  { id: 'ESS-05', domain: 'Communication', section: 'communication', field: 'explainingCondition', text: 'How satisfied were you with how clearly your condition was explained?' },
  { id: 'ESS-06', domain: 'Communication', section: 'communication', field: 'answeringQuestions', text: 'How satisfied were you with how thoroughly your questions were answered?' },
  { id: 'ESS-07', domain: 'Communication', section: 'communication', field: 'timeSpent', text: 'How satisfied were you with the amount of time the provider spent with you?' },

  // Staff & Professionalism (3)
  { id: 'ESS-08', domain: 'Staff & Professionalism', section: 'staffProfessionalism', field: 'receptionCourtesy', text: 'How satisfied were you with the courtesy of the reception staff?' },
  { id: 'ESS-09', domain: 'Staff & Professionalism', section: 'staffProfessionalism', field: 'nursingCourtesy', text: 'How satisfied were you with the courtesy of the nursing staff?' },
  { id: 'ESS-10', domain: 'Staff & Professionalism', section: 'staffProfessionalism', field: 'respectShown', text: 'How satisfied were you with the respect shown to you during your visit?' },

  // Care Quality (3)
  { id: 'ESS-11', domain: 'Care Quality', section: 'careQuality', field: 'involvementInDecisions', text: 'How satisfied were you with your involvement in decisions about your care?' },
  { id: 'ESS-12', domain: 'Care Quality', section: 'careQuality', field: 'treatmentPlanExplanation', text: 'How satisfied were you with how well the treatment plan was explained?' },
  { id: 'ESS-13', domain: 'Care Quality', section: 'careQuality', field: 'confidenceInCare', text: 'How confident were you in the care you received?' },

  // Environment (3)
  { id: 'ESS-14', domain: 'Environment', section: 'environment', field: 'cleanliness', text: 'How satisfied were you with the cleanliness of the facility?' },
  { id: 'ESS-15', domain: 'Environment', section: 'environment', field: 'waitingAreaComfort', text: 'How satisfied were you with the comfort of the waiting area?' },
  { id: 'ESS-16', domain: 'Environment', section: 'environment', field: 'privacy', text: 'How satisfied were you with the privacy provided during your visit?' },

  // Overall Satisfaction (3)
  { id: 'ESS-17', domain: 'Overall Satisfaction', section: 'overallSatisfaction', field: 'overallRating', text: 'How would you rate your overall satisfaction with this visit?' },
  { id: 'ESS-18', domain: 'Overall Satisfaction', section: 'overallSatisfaction', field: 'likelyToRecommend', text: 'How likely are you to recommend this provider to others?' },
  { id: 'ESS-19', domain: 'Overall Satisfaction', section: 'overallSatisfaction', field: 'likelyToReturn', text: 'How likely are you to return to this provider for future care?' }
];

/**
 * Likert response options (1-5).
 */
export const likertResponseOptions = [
  { value: 1, label: 'Very Dissatisfied' },
  { value: 2, label: 'Dissatisfied' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Satisfied' },
  { value: 5, label: 'Very Satisfied' }
];
