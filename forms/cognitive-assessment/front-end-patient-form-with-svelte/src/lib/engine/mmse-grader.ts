import type { AssessmentData, FiredRule } from './types';
import { mmseDomains } from './mmse-rules';
import { mmseCategory } from './utils';

/**
 * Pure function: calculates the MMSE score from patient assessment data.
 * Returns the total score (0-30), its category label, and fired rules
 * for each item that contributed to the score.
 *
 * MMSE Scoring:
 *   24-30 = Normal cognition
 *   18-23 = Mild cognitive impairment
 *   10-17 = Moderate cognitive impairment
 *    0-9  = Severe cognitive impairment
 */
export function calculateMMSE(data: AssessmentData): {
	mmseScore: number;
	mmseCategoryLabel: string;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	// Collect all individual scores from each domain
	const allScores: { domainIndex: number; score: number | null }[] = [];

	// Orientation - Time (5 items)
	const ot = data.orientationScores;
	allScores.push(
		{ domainIndex: 0, score: ot.year },
		{ domainIndex: 1, score: ot.season },
		{ domainIndex: 2, score: ot.date },
		{ domainIndex: 3, score: ot.day },
		{ domainIndex: 4, score: ot.month }
	);

	// Orientation - Place (5 items)
	allScores.push(
		{ domainIndex: 5, score: ot.country },
		{ domainIndex: 6, score: ot.county },
		{ domainIndex: 7, score: ot.town },
		{ domainIndex: 8, score: ot.hospital },
		{ domainIndex: 9, score: ot.floor }
	);

	// Registration (3 items)
	const reg = data.registrationScores;
	allScores.push(
		{ domainIndex: 10, score: reg.object1 },
		{ domainIndex: 11, score: reg.object2 },
		{ domainIndex: 12, score: reg.object3 }
	);

	// Attention & Calculation (5 items)
	const att = data.attentionScores;
	allScores.push(
		{ domainIndex: 13, score: att.serial1 },
		{ domainIndex: 14, score: att.serial2 },
		{ domainIndex: 15, score: att.serial3 },
		{ domainIndex: 16, score: att.serial4 },
		{ domainIndex: 17, score: att.serial5 }
	);

	// Recall (3 items)
	const rec = data.recallScores;
	allScores.push(
		{ domainIndex: 18, score: rec.object1 },
		{ domainIndex: 19, score: rec.object2 },
		{ domainIndex: 20, score: rec.object3 }
	);

	// Language - uses repetitionCommands which maps to all 8 language items
	const lang = data.repetitionCommands;
	allScores.push(
		{ domainIndex: 21, score: lang.naming1 },
		{ domainIndex: 22, score: lang.naming2 },
		{ domainIndex: 23, score: lang.repetition },
		{ domainIndex: 24, score: lang.command1 },
		{ domainIndex: 25, score: lang.command2 },
		{ domainIndex: 26, score: lang.command3 },
		{ domainIndex: 27, score: lang.reading },
		{ domainIndex: 28, score: lang.writing }
	);

	// Visuospatial (1 item)
	const vis = data.visuospatialScores;
	allScores.push(
		{ domainIndex: 29, score: vis.copying }
	);

	let mmseScore = 0;

	for (const { domainIndex, score } of allScores) {
		if (score !== null && score > 0) {
			const domainDef = mmseDomains[domainIndex];
			firedRules.push({
				id: domainDef.id,
				domain: domainDef.domain,
				description: domainDef.item,
				score
			});
			mmseScore += score;
		}
	}

	const mmseCategoryLabel = mmseCategory(mmseScore);

	return { mmseScore, mmseCategoryLabel, firedRules };
}
