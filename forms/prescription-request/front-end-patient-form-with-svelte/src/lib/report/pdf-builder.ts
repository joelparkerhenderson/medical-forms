import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { priorityLevelLabel } from '$lib/engine/utils';

export function buildPdfDocument(
  data: AssessmentData,
  result: GradingResult
): TDocumentDefinitions {
  return {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    header: {
      text: 'PRESCRIPTION REQUEST REPORT',
      alignment: 'center',
      margin: [0, 20, 0, 0],
      fontSize: 10,
      color: '#6b7280',
      bold: true
    },
    footer: (currentPage: number, pageCount: number) => ({
      text: `Page ${currentPage} of ${pageCount} | Generated ${new Date(result.timestamp).toLocaleString()}`,
      alignment: 'center',
      margin: [0, 20, 0, 0],
      fontSize: 8,
      color: '#9ca3af'
    }),
    content: [
      {
        text: `Priority: ${result.priorityLevel.toUpperCase()}`,
        fontSize: 24,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 4]
      },
      {
        text: priorityLevelLabel(result.priorityLevel),
        fontSize: 14,
        alignment: 'center',
        color: '#4b5563',
        margin: [0, 0, 0, 20]
      },

      sectionHeader('Patient Details'),
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              field('Name', `${data.patientInformation.firstName} ${data.patientInformation.lastName}`),
              field('NHS Number', data.patientInformation.nhsNumber || 'N/A')
            ],
            [
              field('Phone', data.patientInformation.phone || 'N/A'),
              field('Email', data.patientInformation.email || 'N/A')
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 16] as [number, number, number, number]
      },

      sectionHeader('Clinician Details'),
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              field('Name', `${data.clinicianInformation.firstName} ${data.clinicianInformation.lastName}`),
              field('NHS Employee No.', data.clinicianInformation.nhsEmployeeNumber || 'N/A')
            ],
            [
              field('Phone', data.clinicianInformation.phone || 'N/A'),
              field('Email', data.clinicianInformation.email || 'N/A')
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 16] as [number, number, number, number]
      },

      sectionHeader('Prescription Details'),
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              field('Medication', data.prescriptionDetails.medicationName || 'N/A'),
              field('Dosage', data.prescriptionDetails.dosage || 'N/A')
            ],
            [
              field('Frequency', data.prescriptionDetails.frequency || 'N/A'),
              field('Route', data.prescriptionDetails.routeOfAdministration || 'N/A')
            ],
            [
              field('Request Date', data.prescriptionDetails.requestDate || 'N/A'),
              field('Type', data.requestType.isNewPrescription === 'yes' ? 'New' : data.requestType.isNewPrescription === 'no' ? 'Refill' : 'N/A')
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 16] as [number, number, number, number]
      },

      ...(data.prescriptionDetails.treatmentInstructions.trim()
        ? [
            sectionHeader('Treatment Instructions'),
            {
              text: data.prescriptionDetails.treatmentInstructions,
              margin: [0, 0, 0, 16] as [number, number, number, number]
            }
          ]
        : []),

      ...(result.additionalFlags.length > 0
        ? [
            sectionHeader('Flagged Issues for Clinician'),
            {
              ul: result.additionalFlags.map(
                (f) => ({
                  text: `[${f.priority.toUpperCase()}] ${f.category}: ${f.message}`,
                  color: f.priority === 'high' ? '#dc2626' : f.priority === 'medium' ? '#d97706' : '#4b5563',
                  margin: [0, 2, 0, 2] as [number, number, number, number]
                })
              ),
              margin: [0, 0, 0, 16] as [number, number, number, number]
            }
          ]
        : []),

      ...(result.firedRules.length > 0
        ? [
            sectionHeader('Priority Classification Justification'),
            {
              table: {
                headerRows: 1,
                widths: [60, 80, '*', 60],
                body: [
                  [
                    { text: 'Rule ID', bold: true, fontSize: 9 },
                    { text: 'Category', bold: true, fontSize: 9 },
                    { text: 'Finding', bold: true, fontSize: 9 },
                    { text: 'Priority', bold: true, fontSize: 9 }
                  ],
                  ...result.firedRules.map((r) => [
                    { text: r.id, fontSize: 8, color: '#6b7280' },
                    { text: r.category, fontSize: 9 },
                    { text: r.description, fontSize: 9 },
                    { text: r.priorityLevel, fontSize: 9, bold: true }
                  ])
                ]
              },
              layout: 'lightHorizontalLines',
              margin: [0, 0, 0, 16] as [number, number, number, number]
            }
          ]
        : [])
    ],
    defaultStyle: {
      fontSize: 10
    }
  };
}

function sectionHeader(text: string) {
  return {
    text,
    fontSize: 14,
    bold: true,
    color: '#1f2937',
    margin: [0, 8, 0, 8] as [number, number, number, number]
  };
}

function field(label: string, value: string) {
  return {
    text: [
      { text: `${label}: `, bold: true, color: '#6b7280' },
      { text: value }
    ],
    margin: [0, 4, 0, 4] as [number, number, number, number]
  };
}
