/** Patient row displayed in the clinician dashboard */
export interface PatientRow {
	id: string;
	nhsNumber: string;
	patientName: string;
	vaGrade: string;
	affectedEye: string;
	primaryCondition: string;
	iopStatus: string;
}

/** Response from GET /api/dashboard/patients */
export interface DashboardPatientsResponse {
	items: PatientRow[];
	total: number;
}
