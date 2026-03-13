export interface StepConfig {
	number: number;
	title: string;
	sectionKey: string;
}

export const steps: StepConfig[] = [
	{ number: 1, title: 'Patient Demographics', sectionKey: 'patientDemographics' },
	{ number: 2, title: 'Diabetes History', sectionKey: 'diabetesHistory' },
	{ number: 3, title: 'Cardiovascular History', sectionKey: 'cardiovascularHistory' },
	{ number: 4, title: 'Blood Pressure', sectionKey: 'bloodPressure' },
	{ number: 5, title: 'Lipid Profile', sectionKey: 'lipidProfile' },
	{ number: 6, title: 'Renal Function', sectionKey: 'renalFunction' },
	{ number: 7, title: 'Lifestyle Factors', sectionKey: 'lifestyleFactors' },
	{ number: 8, title: 'Current Medications', sectionKey: 'currentMedications' },
	{ number: 9, title: 'Complications Screening', sectionKey: 'complicationsScreening' },
	{ number: 10, title: 'Risk Assessment Summary', sectionKey: 'riskAssessmentSummary' }
];

export const TOTAL_STEPS = steps.length;
