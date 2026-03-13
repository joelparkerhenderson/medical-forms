/** Patient row displayed in the clinician dashboard */
export interface PatientRow {
	id: string;
	nhsNumber: string;
	patientName: string;
	phq9Score: number;
	gad7Score: number;
	riskLevel: string;
	allergyFlag: boolean;
	previousAdverseIncident: boolean;
}

/** Response from GET /api/dashboard/patients */
export interface DashboardPatientsResponse {
	items: PatientRow[];
	total: number;
}
