import type { AssessmentData, FiredRule } from './types';
import { bloodCountScore } from './utils';

/** A declarative hematology concern rule. */
interface HematologyRule {
	id: string;
	category: string;
	description: string;
	concernLevel: string;
	evaluate: (d: AssessmentData) => boolean;
}

/** All hematology rules, ordered by concern level (high -> medium -> low). */
export function allRules(): HematologyRule[] {
	return [
		// ─── HIGH CONCERN ───────────────────────────────────────
		{
			id: 'HEM-001',
			category: 'Blood Count',
			description: 'Critical hemoglobin level (<7 g/dL) - severe anemia',
			concernLevel: 'high',
			evaluate: (d) => d.bloodCountAnalysis.hemoglobin !== null && d.bloodCountAnalysis.hemoglobin < 7.0
		},
		{
			id: 'HEM-002',
			category: 'Blood Count',
			description: 'Severe thrombocytopenia (platelets <20 x10^9/L) - bleeding risk',
			concernLevel: 'high',
			evaluate: (d) => d.bloodCountAnalysis.plateletCount !== null && d.bloodCountAnalysis.plateletCount < 20.0
		},
		{
			id: 'HEM-003',
			category: 'Blood Count',
			description: 'Severe leukocytosis (WBC >30 x10^9/L) - possible malignancy',
			concernLevel: 'high',
			evaluate: (d) => d.bloodCountAnalysis.whiteBloodCellCount !== null && d.bloodCountAnalysis.whiteBloodCellCount > 30.0
		},
		{
			id: 'HEM-004',
			category: 'Coagulation',
			description: 'Critically elevated INR (>4.0) - major hemorrhage risk',
			concernLevel: 'high',
			evaluate: (d) => d.coagulationStudies.inr !== null && d.coagulationStudies.inr > 4.0
		},
		{
			id: 'HEM-005',
			category: 'Coagulation',
			description: 'Severely low fibrinogen (<100 mg/dL) - DIC risk',
			concernLevel: 'high',
			evaluate: (d) => d.coagulationStudies.fibrinogen !== null && d.coagulationStudies.fibrinogen < 100.0
		},
		// ─── MEDIUM CONCERN ─────────────────────────────────────
		{
			id: 'HEM-006',
			category: 'Blood Count',
			description: 'Moderate anemia (hemoglobin 7-10 g/dL)',
			concernLevel: 'medium',
			evaluate: (d) => d.bloodCountAnalysis.hemoglobin !== null && d.bloodCountAnalysis.hemoglobin >= 7.0 && d.bloodCountAnalysis.hemoglobin < 10.0
		},
		{
			id: 'HEM-007',
			category: 'Blood Count',
			description: 'Moderate thrombocytopenia (platelets 20-50 x10^9/L)',
			concernLevel: 'medium',
			evaluate: (d) => d.bloodCountAnalysis.plateletCount !== null && d.bloodCountAnalysis.plateletCount >= 20.0 && d.bloodCountAnalysis.plateletCount < 50.0
		},
		{
			id: 'HEM-008',
			category: 'Blood Count',
			description: 'Leukopenia (WBC <4.0 x10^9/L) - infection risk',
			concernLevel: 'medium',
			evaluate: (d) => d.bloodCountAnalysis.whiteBloodCellCount !== null && d.bloodCountAnalysis.whiteBloodCellCount < 4.0
		},
		{
			id: 'HEM-009',
			category: 'Blood Count',
			description: 'Microcytosis (MCV <80 fL) - possible iron deficiency',
			concernLevel: 'medium',
			evaluate: (d) => d.bloodCountAnalysis.meanCorpuscularVolume !== null && d.bloodCountAnalysis.meanCorpuscularVolume < 80.0
		},
		{
			id: 'HEM-010',
			category: 'Blood Count',
			description: 'Macrocytosis (MCV >100 fL) - possible B12/folate deficiency',
			concernLevel: 'medium',
			evaluate: (d) => d.bloodCountAnalysis.meanCorpuscularVolume !== null && d.bloodCountAnalysis.meanCorpuscularVolume > 100.0
		},
		{
			id: 'HEM-011',
			category: 'Coagulation',
			description: 'Elevated INR (1.5-4.0) - coagulopathy',
			concernLevel: 'medium',
			evaluate: (d) => d.coagulationStudies.inr !== null && d.coagulationStudies.inr > 1.5 && d.coagulationStudies.inr <= 4.0
		},
		{
			id: 'HEM-012',
			category: 'Coagulation',
			description: 'Elevated D-dimer (>2.0 mg/L) - thrombotic concern',
			concernLevel: 'medium',
			evaluate: (d) => d.coagulationStudies.dDimer !== null && d.coagulationStudies.dDimer > 2.0
		},
		{
			id: 'HEM-013',
			category: 'Iron Studies',
			description: 'Severely depleted ferritin (<10 ng/mL) - iron deficiency',
			concernLevel: 'medium',
			evaluate: (d) => d.ironStudies.serumFerritin !== null && d.ironStudies.serumFerritin < 10.0
		},
		{
			id: 'HEM-014',
			category: 'Iron Studies',
			description: 'Iron overload (ferritin >500 ng/mL) - hemochromatosis risk',
			concernLevel: 'medium',
			evaluate: (d) => d.ironStudies.serumFerritin !== null && d.ironStudies.serumFerritin > 500.0
		},
		{
			id: 'HEM-015',
			category: 'Blood Count',
			description: 'Blood count dimension score above 60% - multiple abnormalities',
			concernLevel: 'medium',
			evaluate: (d) => {
				const s = bloodCountScore(d);
				return s !== null && s > 60;
			}
		},
		// ─── LOW CONCERN ────────────────────────────────────────
		{
			id: 'HEM-016',
			category: 'Blood Count',
			description: 'All blood count values within normal range',
			concernLevel: 'low',
			evaluate: (d) => {
				const hgb = d.bloodCountAnalysis.hemoglobin;
				const wbc = d.bloodCountAnalysis.whiteBloodCellCount;
				const plt = d.bloodCountAnalysis.plateletCount;
				const mcv = d.bloodCountAnalysis.meanCorpuscularVolume;
				return (
					hgb !== null && hgb >= 12.0 && hgb <= 17.0 &&
					wbc !== null && wbc >= 4.0 && wbc <= 11.0 &&
					plt !== null && plt >= 150.0 && plt <= 400.0 &&
					(mcv === null || (mcv >= 80.0 && mcv <= 100.0))
				);
			}
		},
		{
			id: 'HEM-017',
			category: 'Coagulation',
			description: 'All coagulation studies within normal range',
			concernLevel: 'low',
			evaluate: (d) => {
				const pt = d.coagulationStudies.prothrombinTime;
				const inr = d.coagulationStudies.inr;
				const aptt = d.coagulationStudies.activatedPartialThromboplastinTime;
				return (
					inr !== null && inr >= 0.8 && inr <= 1.2 &&
					(pt === null || (pt >= 11.0 && pt <= 13.5)) &&
					(aptt === null || (aptt >= 25.0 && aptt <= 35.0))
				);
			}
		},
		{
			id: 'HEM-018',
			category: 'Iron Studies',
			description: 'Iron studies within normal range',
			concernLevel: 'low',
			evaluate: (d) => {
				const ferritin = d.ironStudies.serumFerritin;
				const iron = d.ironStudies.serumIron;
				const tsat = d.ironStudies.transferrinSaturation;
				return (
					ferritin !== null && ferritin >= 20.0 && ferritin <= 250.0 &&
					(iron === null || (iron >= 60.0 && iron <= 170.0)) &&
					(tsat === null || (tsat >= 20.0 && tsat <= 50.0))
				);
			}
		},
		{
			id: 'HEM-019',
			category: 'Coagulation',
			description: 'Mildly elevated D-dimer (0.5-2.0 mg/L) - monitor',
			concernLevel: 'low',
			evaluate: (d) => d.coagulationStudies.dDimer !== null && d.coagulationStudies.dDimer > 0.5 && d.coagulationStudies.dDimer <= 2.0
		},
		{
			id: 'HEM-020',
			category: 'Blood Count',
			description: 'Elevated RDW (>14.5%) - anisocytosis',
			concernLevel: 'low',
			evaluate: (d) => d.bloodCountAnalysis.redCellDistributionWidth !== null && d.bloodCountAnalysis.redCellDistributionWidth > 14.5
		}
	];
}

/** Evaluate all rules against data and return fired rules. */
export function evaluateRules(data: AssessmentData): FiredRule[] {
	const fired: FiredRule[] = [];
	for (const rule of allRules()) {
		if (rule.evaluate(data)) {
			fired.push({
				id: rule.id,
				category: rule.category,
				description: rule.description,
				concernLevel: rule.concernLevel
			});
		}
	}
	return fired;
}
