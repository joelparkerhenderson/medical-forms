/** Patient row displayed in the clinician dashboard */
export interface PatientRow {
	id: string;
	nhsNumber: string;
	patientName: string;
	completenessLevel: string;
	reviewDate: string;
	witnessed: boolean;
	lastUpdated: string;
}

/** Response from GET /api/dashboard/patients */
export interface DashboardPatientsResponse {
	items: PatientRow[];
	total: number;
}
