/** Patient row displayed in the clinician dashboard */
export interface PatientRow {
	id: string;
	nhsNumber: string;
	patientName: string;
	vaccinationLevel: string;
	vaccinationScore: number;
	flagCount: number;
	submittedDate: string;
}

/** Response from GET /api/dashboard/patients */
export interface DashboardPatientsResponse {
	items: PatientRow[];
	total: number;
}
