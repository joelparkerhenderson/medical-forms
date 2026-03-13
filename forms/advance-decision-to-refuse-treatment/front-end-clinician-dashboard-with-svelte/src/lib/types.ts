/** Patient row displayed in the clinician dashboard */
export interface PatientRow {
	id: string;
	nhsNumber: string;
	patientName: string;
	validityStatus: string;
	lifeSustainingRefusal: boolean;
	witnessed: boolean;
	reviewDate: string;
	lpaStatus: string;
}

/** Response from GET /api/dashboard/patients */
export interface DashboardPatientsResponse {
	items: PatientRow[];
	total: number;
}
