import "clsx";
function createDefaultAssessment() {
  return {
    practiceConfiguration: {
      practiceName: "",
      practiceAddress: "",
      dpoName: "",
      dpoContactDetails: "",
      researchOrganisations: "",
      dataSharingPartners: ""
    },
    acknowledgmentSignature: {
      agreed: false,
      patientTypedFullName: "",
      patientTypedDate: ""
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
