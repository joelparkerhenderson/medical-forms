// Default form data structure

export function createDefaultData() {
  return {
    config: {
      practiceName: '',
      practiceAddress: '',
      dpoName: '',
      dpoContactDetails: '',
      researchOrganisations: '',
      dataSharingPartners: '',
    },
    acknowledgment: {
      checked: false,
      patientName: '',
      date: '',
    },
    submittedAt: null,
  };
}
