import type { VARule } from './types';
import { snellenToDecimal } from './utils';

/**
 * Declarative visual acuity grading rules.
 * Each rule evaluates patient data and returns true if the condition is present.
 * The VA grade is determined by the worst-grade rule that fires.
 * 'normal' is the default when no rules fire (healthy eyes).
 */
export const vaRules: VARule[] = [
	// ─── VISUAL ACUITY ──────────────────────────────────────
	{
		id: 'VA-001',
		system: 'Visual Acuity',
		description: 'Mild visual impairment (best corrected VA around 6/12)',
		grade: 'mild',
		evaluate: (d) => {
			const right = snellenToDecimal(d.visualAcuity.distanceVaRightCorrected);
			const left = snellenToDecimal(d.visualAcuity.distanceVaLeftCorrected);
			const best = Math.max(right ?? 0, left ?? 0);
			return best > 0 && best < 0.95 && best >= 0.45;
		}
	},
	{
		id: 'VA-002',
		system: 'Visual Acuity',
		description: 'Moderate visual impairment (best corrected VA 6/18 to 6/60)',
		grade: 'moderate',
		evaluate: (d) => {
			const right = snellenToDecimal(d.visualAcuity.distanceVaRightCorrected);
			const left = snellenToDecimal(d.visualAcuity.distanceVaLeftCorrected);
			const best = Math.max(right ?? 0, left ?? 0);
			return best > 0 && best < 0.45 && best >= 0.095;
		}
	},
	{
		id: 'VA-003',
		system: 'Visual Acuity',
		description: 'Severe visual impairment (best corrected VA 6/60 to 3/60)',
		grade: 'severe',
		evaluate: (d) => {
			const right = snellenToDecimal(d.visualAcuity.distanceVaRightCorrected);
			const left = snellenToDecimal(d.visualAcuity.distanceVaLeftCorrected);
			const best = Math.max(right ?? 0, left ?? 0);
			return best > 0 && best < 0.095 && best >= 0.045;
		}
	},
	{
		id: 'VA-004',
		system: 'Visual Acuity',
		description: 'Blindness (best corrected VA worse than 3/60)',
		grade: 'blindness',
		evaluate: (d) => {
			const right = snellenToDecimal(d.visualAcuity.distanceVaRightCorrected);
			const left = snellenToDecimal(d.visualAcuity.distanceVaLeftCorrected);
			const best = Math.max(right ?? 0, left ?? 0);
			return best > 0 && best < 0.045;
		}
	},

	// ─── INTRAOCULAR PRESSURE ───────────────────────────────
	{
		id: 'IOP-001',
		system: 'Intraocular Pressure',
		description: 'Raised IOP (22-30 mmHg)',
		grade: 'mild',
		evaluate: (d) => {
			const right = d.anteriorSegment.iopRight;
			const left = d.anteriorSegment.iopLeft;
			const maxIop = Math.max(right ?? 0, left ?? 0);
			return maxIop > 21 && maxIop <= 30;
		}
	},
	{
		id: 'IOP-002',
		system: 'Intraocular Pressure',
		description: 'Significantly raised IOP (>30 mmHg)',
		grade: 'moderate',
		evaluate: (d) => {
			const right = d.anteriorSegment.iopRight;
			const left = d.anteriorSegment.iopLeft;
			const maxIop = Math.max(right ?? 0, left ?? 0);
			return maxIop > 30;
		}
	},

	// ─── OPTIC DISC ─────────────────────────────────────────
	{
		id: 'OD-001',
		system: 'Optic Disc',
		description: 'Abnormal optic disc',
		grade: 'mild',
		evaluate: (d) => d.posteriorSegment.opticDiscNormal === 'no'
	},

	// ─── MACULA ─────────────────────────────────────────────
	{
		id: 'MC-001',
		system: 'Macula',
		description: 'Macular abnormality detected',
		grade: 'moderate',
		evaluate: (d) => d.posteriorSegment.maculaNormal === 'no'
	},

	// ─── VISUAL FIELD ───────────────────────────────────────
	{
		id: 'VF-001',
		system: 'Visual Field',
		description: 'Abnormal visual field',
		grade: 'mild',
		evaluate: (d) =>
			d.visualFieldPupils.visualFieldResultRight === 'abnormal' ||
			d.visualFieldPupils.visualFieldResultLeft === 'abnormal'
	},

	// ─── PUPIL ──────────────────────────────────────────────
	{
		id: 'PP-001',
		system: 'Pupils',
		description: 'Relative afferent pupillary defect (RAPD)',
		grade: 'moderate',
		evaluate: (d) => d.visualFieldPupils.rapdPresent === 'yes'
	},

	// ─── ANTERIOR SEGMENT ───────────────────────────────────
	{
		id: 'AS-001',
		system: 'Anterior Segment',
		description: 'Corneal abnormality',
		grade: 'mild',
		evaluate: (d) => d.anteriorSegment.corneaNormal === 'no'
	},
	{
		id: 'AS-002',
		system: 'Anterior Segment',
		description: 'Lens abnormality (cataract/subluxation)',
		grade: 'mild',
		evaluate: (d) => d.anteriorSegment.lensNormal === 'no'
	},

	// ─── POSTERIOR SEGMENT ──────────────────────────────────
	{
		id: 'PS-001',
		system: 'Posterior Segment',
		description: 'Abnormal fundus findings',
		grade: 'moderate',
		evaluate: (d) => d.posteriorSegment.fundusNormal === 'no'
	},
	{
		id: 'PS-002',
		system: 'Posterior Segment',
		description: 'Retinal vessel abnormality',
		grade: 'moderate',
		evaluate: (d) => d.posteriorSegment.retinalVesselsNormal === 'no'
	},
	{
		id: 'PS-003',
		system: 'Posterior Segment',
		description: 'Vitreous abnormality',
		grade: 'mild',
		evaluate: (d) => d.posteriorSegment.vitreousNormal === 'no'
	},

	// ─── SYSTEMIC CONDITIONS ────────────────────────────────
	{
		id: 'SC-001',
		system: 'Systemic',
		description: 'Diabetic retinopathy (background)',
		grade: 'mild',
		evaluate: (d) =>
			d.systemicConditions.diabeticRetinopathy === 'yes' &&
			d.systemicConditions.diabeticRetinopathyStage === 'background'
	},
	{
		id: 'SC-002',
		system: 'Systemic',
		description: 'Diabetic retinopathy (pre-proliferative/proliferative)',
		grade: 'moderate',
		evaluate: (d) =>
			d.systemicConditions.diabeticRetinopathy === 'yes' &&
			(d.systemicConditions.diabeticRetinopathyStage === 'pre-proliferative' ||
				d.systemicConditions.diabeticRetinopathyStage === 'proliferative')
	},
	{
		id: 'SC-003',
		system: 'Systemic',
		description: 'Diabetic maculopathy',
		grade: 'moderate',
		evaluate: (d) =>
			d.systemicConditions.diabeticRetinopathy === 'yes' &&
			d.systemicConditions.diabeticRetinopathyStage === 'maculopathy'
	},
	{
		id: 'SC-004',
		system: 'Systemic',
		description: 'Thyroid eye disease',
		grade: 'mild',
		evaluate: (d) => d.systemicConditions.thyroidEyeDisease === 'yes'
	},

	// ─── FUNCTIONAL IMPACT ──────────────────────────────────
	{
		id: 'FI-001',
		system: 'Functional',
		description: 'Severe reading difficulty',
		grade: 'moderate',
		evaluate: (d) =>
			d.functionalImpact.readingAbility === 'severe-difficulty' ||
			d.functionalImpact.readingAbility === 'unable'
	},
	{
		id: 'FI-002',
		system: 'Functional',
		description: 'Falls risk related to vision',
		grade: 'moderate',
		evaluate: (d) => d.functionalImpact.fallsRisk === 'yes'
	},
	{
		id: 'FI-003',
		system: 'Functional',
		description: 'Ceased driving due to vision',
		grade: 'mild',
		evaluate: (d) => d.functionalImpact.drivingStatus === 'ceased-driving'
	}
];
