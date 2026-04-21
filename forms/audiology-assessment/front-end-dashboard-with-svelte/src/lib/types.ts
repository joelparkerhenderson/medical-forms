/** Patient row displayed in the clinician dashboard */
export interface PatientRow {
	id: string;
	nhsNumber: string;
	patientName: string;
	hearingGrade: string;
	affectedEar: string;
	hearingLossType: string;
	tinnitus: boolean;
	hearingAidStatus: string;
}

/** Response from GET /api/dashboard/patients */
export interface DashboardPatientsResponse {
	items: PatientRow[];
	total: number;
}
