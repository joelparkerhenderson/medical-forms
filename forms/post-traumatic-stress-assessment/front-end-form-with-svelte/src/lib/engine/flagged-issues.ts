import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Safety-critical clinical flags for PCL-5 results.
 */
export function detectAdditionalFlags(
	data: AssessmentData,
	total: number,
	probableDsm5: boolean
): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// Suicidality / self-destructive behaviour proxy: item 16 (reckless/self-destructive) ≥ 3
	const item16 = data.clusterEArousalReactivity.item16RecklessOrSelfDestructive ?? 0;
	if (item16 >= 3) {
		flags.push({
			id: 'FLAG-SELFHARM-001',
			category: 'Self-harm / reckless behaviour',
			message: 'Item 16 (reckless or self-destructive behaviour) rated Quite a bit or Extremely — screen for suicidality and safety-plan before leaving the consultation',
			priority: 'high'
		});
	}

	// Severe dissociation proxy: item 3 (reliving) + item 8 (amnesia) both ≥ 3
	const item3 = data.clusterBIntrusion.item3FeelingReliving ?? 0;
	const item8 = data.clusterDNegativeAlterations.item8TroubleRememberingImportantParts ?? 0;
	if (item3 >= 3 && item8 >= 3) {
		flags.push({
			id: 'FLAG-DISSOCIATION-001',
			category: 'Possible dissociative features',
			message: 'Items 3 (reliving) and 8 (memory gaps) both ≥ 3 — consider dissociative subtype (add PCL-5 dissociative items if not already used)',
			priority: 'high'
		});
	}

	if (probableDsm5) {
		flags.push({
			id: 'FLAG-STRUCTURED-INTERVIEW-001',
			category: 'Structured clinical interview recommended',
			message: 'Provisional diagnosis met — CAPS-5 or equivalent structured interview should be arranged to confirm the diagnosis and inform treatment planning',
			priority: 'medium'
		});
	}

	if (total === 0) {
		flags.push({
			id: 'FLAG-NOT-ASSESSED-001',
			category: 'Assessment incomplete',
			message: 'All PCL-5 items are unanswered or zero — confirm patient completed the questionnaire',
			priority: 'medium'
		});
	}

	// Trauma event not recorded
	if (!data.traumaEvent.eventDescription.trim()) {
		flags.push({
			id: 'FLAG-TRAUMA-UNSPECIFIED-001',
			category: 'Trauma event not specified',
			message: 'No trauma event description recorded — PCL-5 score must be interpreted in the context of a specified Criterion A event',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
