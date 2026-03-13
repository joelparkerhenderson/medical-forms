import "clsx";
function createDefaultAssessment() {
  return {
    demographics: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      sex: "",
      educationLevel: "",
      primaryLanguage: "",
      handedness: ""
    },
    referralInformation: {
      referralSource: "",
      referralReason: "",
      referringClinician: "",
      referralDate: "",
      urgency: "",
      previousCognitiveAssessment: "",
      previousAssessmentDetails: ""
    },
    orientationScores: {
      year: null,
      season: null,
      date: null,
      day: null,
      month: null,
      country: null,
      county: null,
      town: null,
      hospital: null,
      floor: null
    },
    registrationScores: { object1: null, object2: null, object3: null },
    attentionScores: {
      serial1: null,
      serial2: null,
      serial3: null,
      serial4: null,
      serial5: null
    },
    recallScores: { object1: null, object2: null, object3: null },
    languageScores: {
      naming1: null,
      naming2: null,
      repetition: null,
      command1: null,
      command2: null,
      command3: null,
      reading: null,
      writing: null
    },
    repetitionCommands: {
      naming1: null,
      naming2: null,
      repetition: null,
      command1: null,
      command2: null,
      command3: null,
      reading: null,
      writing: null
    },
    visuospatialScores: { copying: null },
    functionalHistory: {
      livingArrangement: "",
      adlBathing: "",
      adlDressing: "",
      adlMeals: "",
      adlMedications: "",
      adlFinances: "",
      adlTransport: "",
      recentChanges: "",
      safetyConerns: "",
      carersAvailable: "",
      carerDetails: ""
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
