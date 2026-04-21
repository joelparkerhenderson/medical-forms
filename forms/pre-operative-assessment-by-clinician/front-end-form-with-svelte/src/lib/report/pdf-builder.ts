import type { ClinicianAssessment, GradingResult } from '$lib/engine/types.js';

/**
 * Build a pdfmake document definition for a clinician pre-op assessment.
 */
export function buildPdfDoc(data: ClinicianAssessment, result: GradingResult) {
  const rows = (title: string, lines: string[]) => [
    { text: title, style: 'sectionHeader', margin: [0, 8, 0, 4] },
    ...lines.map((l) => ({ text: l, margin: [0, 0, 0, 2] })),
  ];

  return {
    content: [
      { text: 'Pre-operative Assessment by Clinician', style: 'title' },
      {
        columns: [
          [
            { text: `Clinician: ${data.clinician.clinicianName}`, bold: true },
            `Role: ${data.clinician.clinicianRole}`,
            `${data.clinician.registrationBody} ${data.clinician.registrationNumber}`,
            `${data.clinician.siteName} — ${data.clinician.assessmentDate} ${data.clinician.assessmentTime}`,
          ],
          [
            { text: `Patient: ${data.patient.firstName} ${data.patient.lastName}`, bold: true },
            `NHS ${data.patient.nhsNumber}`,
            `DOB ${data.patient.dateOfBirth} · Sex ${data.patient.sex}`,
            `Weight ${data.patient.weightKg ?? '—'} kg · Height ${data.patient.heightCm ?? '—'} cm`,
          ],
        ],
        columnGap: 20,
        margin: [0, 0, 0, 12],
      },
      ...rows('Planned procedure', [
        `Procedure: ${data.surgery.plannedProcedure}`,
        `Specialty: ${data.surgery.surgicalSpecialty}`,
        `Urgency: ${data.surgery.urgency} · Severity: ${data.surgery.surgicalSeverity}`,
      ]),
      ...rows('Scoring', [
        `Computed ASA: ${result.computedAsaGrade}${result.asaEmergencySuffix}`,
        `Final ASA: ${result.finalAsaGrade}${result.asaEmergencySuffix}`,
        result.overrideReason ? `Override reason: ${result.overrideReason}` : '',
        `Mallampati: ${result.mallampatiClass || '—'}`,
        `RCRI: ${result.rcriScore} · STOP-BANG: ${result.stopbangScore} · CFS: ${result.frailtyScale ?? '—'}`,
        `Composite risk: ${result.compositeRisk.toUpperCase()}`,
      ]).filter((x) => !('text' in x) || x.text),
      ...rows(
        'Safety flags',
        result.additionalFlags.length === 0
          ? ['None raised.']
          : result.additionalFlags.map(
              (f) => `[${f.priority.toUpperCase()}] ${f.description} — ${f.suggestedAction}`,
            ),
      ),
      ...rows('Anaesthesia plan', [
        `Technique: ${data.anaesthesiaPlan.technique}`,
        `Airway: ${data.anaesthesiaPlan.airwayPlan}`,
        `Monitoring: ${data.anaesthesiaPlan.monitoringLevel}`,
        `Analgesia: ${data.anaesthesiaPlan.analgesiaPlan}`,
        `Disposition: ${data.anaesthesiaPlan.postOpDisposition}`,
      ]),
      ...rows('Clinician notes', [data.summary.clinicianNotes || '—']),
      {
        text: '\n\nSigned: ____________________________   Date: _______________',
        margin: [0, 30, 0, 0],
      },
    ],
    styles: {
      title: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      sectionHeader: { fontSize: 13, bold: true, color: '#1d4ed8' },
    },
    defaultStyle: { fontSize: 10 },
  };
}
