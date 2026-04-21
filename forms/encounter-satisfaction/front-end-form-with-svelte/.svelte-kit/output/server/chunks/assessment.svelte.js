import "clsx";
function createDefaultAssessment() {
  return {
    demographics: { firstName: "", lastName: "", dateOfBirth: "", sex: "" },
    visitInformation: {
      visitDate: "",
      department: "",
      providerName: "",
      visitType: "",
      reasonForVisit: "",
      firstVisit: ""
    },
    accessScheduling: {
      easeOfScheduling: null,
      waitForAppointment: null,
      waitInWaitingRoom: null
    },
    communication: {
      listening: null,
      explainingCondition: null,
      answeringQuestions: null,
      timeSpent: null
    },
    staffProfessionalism: {
      receptionCourtesy: null,
      nursingCourtesy: null,
      respectShown: null
    },
    careQuality: {
      involvementInDecisions: null,
      treatmentPlanExplanation: null,
      confidenceInCare: null
    },
    environment: { cleanliness: null, waitingAreaComfort: null, privacy: null },
    overallSatisfaction: {
      overallRating: null,
      likelyToRecommend: null,
      likelyToReturn: null,
      comments: ""
    }
  };
}
class AssessmentStore {
  data = createDefaultAssessment();
  result = null;
  currentStep = 1;
  reset() {
    this.data = createDefaultAssessment();
    this.result = null;
    this.currentStep = 1;
  }
}
const assessment = new AssessmentStore();
export {
  assessment as a
};
