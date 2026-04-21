import type { VaccinationRule } from './types';

/**
 * Declarative vaccination compliance rules.
 * Each rule evaluates patient data and returns true if the condition is present.
 * Grade 1 = low concern, 2 = moderate, 3 = significant, 4 = critical.
 */
export const vaccinationRules: VaccinationRule[] = [
	// ─── CHILDHOOD IMMUNISATIONS ──────────────────────────────
	{
		id: 'CH-001',
		category: 'Childhood',
		description: 'MMR dose 1 not received or unknown',
		grade: 3,
		evaluate: (d) => d.childhoodImmunisations.mmrDose1 === 'no' || d.childhoodImmunisations.mmrDose1 === 'unknown'
	},
	{
		id: 'CH-002',
		category: 'Childhood',
		description: 'MMR dose 2 not received or unknown',
		grade: 2,
		evaluate: (d) => d.childhoodImmunisations.mmrDose2 === 'no' || d.childhoodImmunisations.mmrDose2 === 'unknown'
	},
	{
		id: 'CH-003',
		category: 'Childhood',
		description: 'DTP primary course incomplete or unknown',
		grade: 3,
		evaluate: (d) => d.childhoodImmunisations.dtpPrimaryCourse === 'no' || d.childhoodImmunisations.dtpPrimaryCourse === 'unknown'
	},
	{
		id: 'CH-004',
		category: 'Childhood',
		description: 'DTP booster not received or unknown',
		grade: 2,
		evaluate: (d) => d.childhoodImmunisations.dtpBooster === 'no' || d.childhoodImmunisations.dtpBooster === 'unknown'
	},
	{
		id: 'CH-005',
		category: 'Childhood',
		description: 'Polio primary course incomplete or unknown',
		grade: 3,
		evaluate: (d) => d.childhoodImmunisations.polioPrimaryCourse === 'no' || d.childhoodImmunisations.polioPrimaryCourse === 'unknown'
	},
	{
		id: 'CH-006',
		category: 'Childhood',
		description: 'Polio booster not received or unknown',
		grade: 2,
		evaluate: (d) => d.childhoodImmunisations.polioBooster === 'no' || d.childhoodImmunisations.polioBooster === 'unknown'
	},

	// ─── OCCUPATIONAL VACCINES ────────────────────────────────
	{
		id: 'OCC-001',
		category: 'Occupational',
		description: 'Hepatitis B course incomplete in healthcare worker',
		grade: 4,
		evaluate: (d) =>
			d.demographics.occupationCategory === 'healthcare' &&
			(d.occupationalVaccines.hepatitisBCourse === 'no' || d.occupationalVaccines.hepatitisBCourse === 'unknown')
	},
	{
		id: 'OCC-002',
		category: 'Occupational',
		description: 'Hepatitis B antibody level inadequate',
		grade: 3,
		evaluate: (d) => d.occupationalVaccines.hepatitisBAntiBodyLevel === 'inadequate'
	},
	{
		id: 'OCC-003',
		category: 'Occupational',
		description: 'Varicella non-immune healthcare worker',
		grade: 3,
		evaluate: (d) =>
			d.demographics.occupationCategory === 'healthcare' &&
			d.occupationalVaccines.varicellaVaccine !== 'yes' &&
			d.occupationalVaccines.varicellaHistory !== 'yes'
	},
	{
		id: 'OCC-004',
		category: 'Occupational',
		description: 'BCG not received in high-risk occupational role',
		grade: 2,
		evaluate: (d) =>
			(d.demographics.occupationCategory === 'healthcare' || d.demographics.occupationCategory === 'social-care') &&
			(d.occupationalVaccines.bcgVaccine === 'no' || d.occupationalVaccines.bcgVaccine === 'unknown')
	},

	// ─── COVID-19 ─────────────────────────────────────────────
	{
		id: 'COV-001',
		category: 'COVID-19',
		description: 'COVID-19 primary course incomplete',
		grade: 3,
		evaluate: (d) => d.covid19Vaccination.covidPrimaryCourse === 'no' || d.covid19Vaccination.covidPrimaryCourse === 'unknown'
	},
	{
		id: 'COV-002',
		category: 'COVID-19',
		description: 'COVID-19 primary course incomplete in healthcare worker',
		grade: 4,
		evaluate: (d) =>
			d.demographics.occupationCategory === 'healthcare' &&
			(d.covid19Vaccination.covidPrimaryCourse === 'no' || d.covid19Vaccination.covidPrimaryCourse === 'unknown')
	},
	{
		id: 'COV-003',
		category: 'COVID-19',
		description: 'No COVID-19 booster received',
		grade: 2,
		evaluate: (d) =>
			d.covid19Vaccination.covidPrimaryCourse === 'yes' &&
			d.covid19Vaccination.covidBooster1 === 'no'
	},

	// ─── INFLUENZA ────────────────────────────────────────────
	{
		id: 'FLU-001',
		category: 'Influenza',
		description: 'Current season flu vaccine not received',
		grade: 2,
		evaluate: (d) => d.influenzaVaccination.fluVaccineCurrentSeason === 'no'
	},
	{
		id: 'FLU-002',
		category: 'Influenza',
		description: 'High-risk patient without current flu vaccine',
		grade: 3,
		evaluate: (d) =>
			d.influenzaVaccination.fluHighRiskGroup === 'yes' &&
			d.influenzaVaccination.fluVaccineCurrentSeason === 'no'
	},
	{
		id: 'FLU-003',
		category: 'Influenza',
		description: 'Healthcare worker without current flu vaccine',
		grade: 3,
		evaluate: (d) =>
			d.demographics.occupationCategory === 'healthcare' &&
			d.influenzaVaccination.fluVaccineCurrentSeason === 'no'
	},

	// ─── TRAVEL ───────────────────────────────────────────────
	{
		id: 'TRV-001',
		category: 'Travel',
		description: 'Travel planned without yellow fever vaccination (if applicable)',
		grade: 3,
		evaluate: (d) =>
			d.travelVaccines.travelPlanned === 'yes' &&
			d.travelVaccines.yellowFeverVaccine === 'no'
	},

	// ─── CONTRAINDICATIONS ────────────────────────────────────
	{
		id: 'CTX-001',
		category: 'Contraindications',
		description: 'Immunocompromised - live vaccines may be contraindicated',
		grade: 3,
		evaluate: (d) => d.vaccinationHistory.immunocompromised === 'yes'
	},
	{
		id: 'CTX-002',
		category: 'Contraindications',
		description: 'Previous anaphylaxis to a vaccine',
		grade: 4,
		evaluate: (d) => d.vaccinationHistory.adverseReactionSeverity === 'anaphylaxis'
	},
	{
		id: 'CTX-003',
		category: 'Contraindications',
		description: 'Pregnant or planning pregnancy - live vaccines contraindicated',
		grade: 3,
		evaluate: (d) => d.vaccinationHistory.pregnantOrPlanning === 'yes'
	},

	// ─── SEROLOGY ─────────────────────────────────────────────
	{
		id: 'SER-001',
		category: 'Serology',
		description: 'Measles IgG negative - not immune',
		grade: 3,
		evaluate: (d) => d.serologyImmunityTesting.measlesIgG === 'negative'
	},
	{
		id: 'SER-002',
		category: 'Serology',
		description: 'Rubella IgG negative - not immune',
		grade: 2,
		evaluate: (d) => d.serologyImmunityTesting.rubellaIgG === 'negative'
	},
	{
		id: 'SER-003',
		category: 'Serology',
		description: 'Varicella IgG negative - not immune',
		grade: 3,
		evaluate: (d) => d.serologyImmunityTesting.varicellaIgG === 'negative'
	},
	{
		id: 'SER-004',
		category: 'Serology',
		description: 'Hepatitis B surface antibody negative',
		grade: 3,
		evaluate: (d) => d.serologyImmunityTesting.hepBSurfaceAntibody === 'negative'
	},
	{
		id: 'SER-005',
		category: 'Serology',
		description: 'TB IGRA positive - latent TB investigation needed',
		grade: 3,
		evaluate: (d) => d.serologyImmunityTesting.tbIGRAResult === 'positive'
	},

	// ─── COMPLIANCE ───────────────────────────────────────────
	{
		id: 'CMP-001',
		category: 'Compliance',
		description: 'Active exposure incident without documented immunity',
		grade: 4,
		evaluate: (d) => d.scheduleCompliance.activeExposureIncident === 'yes'
	},
	{
		id: 'CMP-002',
		category: 'Compliance',
		description: 'Occupational health clearance pending',
		grade: 2,
		evaluate: (d) => d.scheduleCompliance.occupationalHealthClearance === 'pending'
	},
	{
		id: 'CMP-003',
		category: 'Compliance',
		description: 'Occupational health clearance not granted',
		grade: 3,
		evaluate: (d) => d.scheduleCompliance.occupationalHealthClearance === 'no'
	},
];
