/** Patient row displayed in the clinician dashboard */
export interface PatientRow {
	id: string;
	nhsNumber: string;
	patientName: string;
	age: number;
	sex: string;
	riskCategory: string;
	tenYearRisk: number;
	heartAge: number | null;
	flagCount: number;
	submittedDate: string;
}

/** Response from GET /api/dashboard/patients */
export interface DashboardPatientsResponse {
	items: PatientRow[];
	total: number;
}
