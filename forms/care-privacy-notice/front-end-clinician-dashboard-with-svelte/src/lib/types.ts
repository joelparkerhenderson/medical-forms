export interface AcknowledgmentRow {
	id: string;
	patientName: string;
	nhsNumber: string;
	dateAcknowledged: string;
	status: string;
	practiceName: string;
}

export interface DashboardResponse {
	items: AcknowledgmentRow[];
	total: number;
}
