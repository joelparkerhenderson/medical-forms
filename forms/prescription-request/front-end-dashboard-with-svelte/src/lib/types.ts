/** Prescription request row displayed in the clinician dashboard */
export interface PrescriptionRow {
  id: string;
  nhsNumber: string;
  patientName: string;
  clinicianName: string;
  medicationName: string;
  dosage: string;
  requestType: string;
  priorityLevel: string;
  requestDate: string;
  status: string;
}

/** Response from GET /api/dashboard/prescriptions */
export interface DashboardPrescriptionsResponse {
  items: PrescriptionRow[];
  total: number;
}
