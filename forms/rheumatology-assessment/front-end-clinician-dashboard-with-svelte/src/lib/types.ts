/** Patient row displayed in the clinician dashboard */
export interface PatientRow {
	id: string;
	nhsNumber: string;
	patientName: string;
	das28Score: number | null;
	diseaseActivity: string;
	primaryDiagnosis: string;
	currentTreatment: string;
	allergyFlag: boolean;
}

/** Response from GET /api/dashboard/patients */
export interface DashboardPatientsResponse {
	items: PatientRow[];
	total: number;
}
