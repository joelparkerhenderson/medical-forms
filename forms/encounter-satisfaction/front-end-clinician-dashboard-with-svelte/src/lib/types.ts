/** Patient row displayed in the clinician dashboard */
export interface PatientRow {
	id: string;
	patientName: string;
	department: string;
	providerName: string;
	visitType: string;
	compositeScore: number;
	category: string;
	visitDate: string;
	flagCount: number;
}

/** Response from GET /api/dashboard/patients */
export interface DashboardPatientsResponse {
	items: PatientRow[];
	total: number;
}
