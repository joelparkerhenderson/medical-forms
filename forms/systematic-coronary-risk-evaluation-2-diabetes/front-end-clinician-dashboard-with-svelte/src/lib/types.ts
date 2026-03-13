/** Patient row displayed in the clinician dashboard */
export interface PatientRow {
	id: string;
	nhsNumber: string;
	patientName: string;
	riskCategory: string;
	hba1cMmolMol: number;
	systolicBp: number;
	hasEstablishedCvd: boolean;
	flagCount: number;
	status: string;
	submittedDate: string;
}

/** Response from GET /api/dashboard/patients */
export interface DashboardPatientsResponse {
	items: PatientRow[];
	total: number;
}
