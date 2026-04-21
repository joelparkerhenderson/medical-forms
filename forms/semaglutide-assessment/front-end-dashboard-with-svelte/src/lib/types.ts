/** Patient row displayed in the clinician dashboard */
export interface PatientRow {
	id: string;
	nhsNumber: string;
	firstName: string;
	lastName: string;
	dob: string;
	eligibilityStatus: 'Eligible' | 'Conditional' | 'Ineligible';
	primaryIndication: string;
	bmi: number;
	currentDose: string;
	reviewStatus: string;
}

/** Response from GET /api/dashboard/patients */
export interface DashboardPatientsResponse {
	items: PatientRow[];
	total: number;
}
