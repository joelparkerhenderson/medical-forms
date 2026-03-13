/** Patient row displayed in the clinician dashboard */
export interface PatientRow {
	id: string;
	patientName: string;
	mrn: string;
	specimenDate: string;
	referringPhysician: string;
	abnormalityLevel: string;
	abnormalityScore: number;
	diagnosis: string;
	flagCount: number;
}

/** Response from GET /api/dashboard/patients */
export interface DashboardPatientsResponse {
	items: PatientRow[];
	total: number;
}
