export interface AcknowledgmentRow {
	id: string;
	patientName: string;
	nhsNumber: string;
	acknowledgedDate: string;
	status: 'complete' | 'incomplete';
}

export interface DashboardResponse {
	items: AcknowledgmentRow[];
	total: number;
}
