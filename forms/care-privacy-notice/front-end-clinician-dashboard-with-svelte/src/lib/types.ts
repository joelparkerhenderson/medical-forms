/** Patient row displayed in the clinician dashboard */
export interface PatientRow {
	id: string;
	patientName: string;
	nhsNumber: string;
	dateAcknowledged: string;
	status: string;
	practiceName: string;
}

/** Response from GET /api/dashboard/patients */
export interface DashboardPatientsResponse {
	items: PatientRow[];
	total: number;
}
