/** Patient row displayed in the clinician dashboard */
export interface PatientRow {
	id: string;
	nhsNumber: string;
	patientName: string;
	symptomScore: number;
	organSystemsAffected: number;
	tryptaseLevel: string;
	anaphylaxisRisk: boolean;
}

/** Response from GET /api/dashboard/patients */
export interface DashboardPatientsResponse {
	items: PatientRow[];
	total: number;
}
