import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the occupational therapist,
 * independent of COPM score. These are safety-critical or clinically
 * significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Unable to perform self-care ─────────────────────────
	if (data.selfCareActivities.personalCare.difficulty === 'unable') {
		flags.push({
			id: 'FLAG-SELFCARE-001',
			category: 'Self-Care Deficit',
			message: 'Patient reports inability to perform personal care activities - immediate intervention required',
			priority: 'high'
		});
	}

	// ─── Significant mobility issues ─────────────────────────
	if (data.selfCareActivities.functionalMobility.difficulty === 'unable') {
		flags.push({
			id: 'FLAG-MOBILITY-001',
			category: 'Mobility Concern',
			message: 'Patient reports inability to perform functional mobility - falls risk assessment recommended',
			priority: 'high'
		});
	}

	if (data.selfCareActivities.functionalMobility.difficulty === 'significant') {
		flags.push({
			id: 'FLAG-MOBILITY-002',
			category: 'Mobility Concern',
			message: 'Significant functional mobility difficulties reported - assistive device evaluation recommended',
			priority: 'medium'
		});
	}

	// ─── Cognitive deficits ──────────────────────────────────
	if (data.physicalCognitiveStatus.cognition.toLowerCase().includes('impair') ||
		data.physicalCognitiveStatus.cognition.toLowerCase().includes('deficit') ||
		data.physicalCognitiveStatus.cognition.toLowerCase().includes('severe')) {
		flags.push({
			id: 'FLAG-COGNITION-001',
			category: 'Cognitive Deficit',
			message: 'Cognitive impairment noted - cognitive screening and safety assessment recommended',
			priority: 'high'
		});
	}

	// ─── Safety concerns at home ─────────────────────────────
	if (data.environmentalFactors.homeEnvironment.toLowerCase().includes('unsafe') ||
		data.environmentalFactors.homeEnvironment.toLowerCase().includes('hazard') ||
		data.environmentalFactors.homeEnvironment.toLowerCase().includes('barrier') ||
		data.environmentalFactors.homeEnvironment.toLowerCase().includes('risk')) {
		flags.push({
			id: 'FLAG-HOME-001',
			category: 'Home Safety',
			message: 'Home environment safety concerns identified - home assessment recommended',
			priority: 'high'
		});
	}

	// ─── Social isolation ────────────────────────────────────
	if (data.leisureActivities.socialParticipation.difficulty === 'unable') {
		flags.push({
			id: 'FLAG-SOCIAL-001',
			category: 'Social Isolation',
			message: 'Patient unable to participate socially - risk of isolation and depression, psychosocial support recommended',
			priority: 'high'
		});
	}

	if (data.leisureActivities.socialParticipation.difficulty === 'significant') {
		flags.push({
			id: 'FLAG-SOCIAL-002',
			category: 'Social Isolation',
			message: 'Significant difficulty with social participation - community integration support recommended',
			priority: 'medium'
		});
	}

	if (data.environmentalFactors.socialSupport.toLowerCase().includes('none') ||
		data.environmentalFactors.socialSupport.toLowerCase().includes('limited') ||
		data.environmentalFactors.socialSupport.toLowerCase().includes('isolated')) {
		flags.push({
			id: 'FLAG-SOCIAL-003',
			category: 'Social Isolation',
			message: 'Limited social support identified - consider referral to social services',
			priority: 'medium'
		});
	}

	// ─── Pain interfering with function ──────────────────────
	if (data.physicalCognitiveStatus.pain.toLowerCase().includes('severe') ||
		data.physicalCognitiveStatus.pain.toLowerCase().includes('chronic') ||
		data.physicalCognitiveStatus.pain.toLowerCase().includes('debilitating')) {
		flags.push({
			id: 'FLAG-PAIN-001',
			category: 'Pain Management',
			message: 'Significant pain reported - pain management consultation and adaptive strategies recommended',
			priority: 'high'
		});
	}

	if (data.physicalCognitiveStatus.pain.toLowerCase().includes('moderate')) {
		flags.push({
			id: 'FLAG-PAIN-002',
			category: 'Pain Management',
			message: 'Moderate pain reported - monitor impact on occupational performance',
			priority: 'medium'
		});
	}

	// ─── Falls risk ──────────────────────────────────────────
	if (data.physicalCognitiveStatus.lowerExtremity.toLowerCase().includes('weakness') ||
		data.physicalCognitiveStatus.lowerExtremity.toLowerCase().includes('instability') ||
		data.physicalCognitiveStatus.lowerExtremity.toLowerCase().includes('impair')) {
		flags.push({
			id: 'FLAG-FALLS-001',
			category: 'Falls Risk',
			message: 'Lower extremity impairment detected - falls prevention assessment recommended',
			priority: 'high'
		});
	}

	if (data.physicalCognitiveStatus.coordination.toLowerCase().includes('poor') ||
		data.physicalCognitiveStatus.coordination.toLowerCase().includes('impair')) {
		flags.push({
			id: 'FLAG-FALLS-002',
			category: 'Falls Risk',
			message: 'Coordination impairment noted - falls risk may be elevated',
			priority: 'medium'
		});
	}

	// ─── Vision concerns ─────────────────────────────────────
	if (data.physicalCognitiveStatus.vision.toLowerCase().includes('impair') ||
		data.physicalCognitiveStatus.vision.toLowerCase().includes('loss') ||
		data.physicalCognitiveStatus.vision.toLowerCase().includes('blind')) {
		flags.push({
			id: 'FLAG-VISION-001',
			category: 'Vision Concern',
			message: 'Vision impairment reported - environmental adaptation and safety assessment recommended',
			priority: 'medium'
		});
	}

	// ─── Fatigue concerns ────────────────────────────────────
	if (data.physicalCognitiveStatus.fatigue.toLowerCase().includes('severe') ||
		data.physicalCognitiveStatus.fatigue.toLowerCase().includes('extreme') ||
		data.physicalCognitiveStatus.fatigue.toLowerCase().includes('debilitating')) {
		flags.push({
			id: 'FLAG-FATIGUE-001',
			category: 'Fatigue',
			message: 'Severe fatigue reported - energy conservation strategies and activity pacing recommended',
			priority: 'medium'
		});
	}

	// ─── Community management difficulty ─────────────────────
	if (data.selfCareActivities.communityManagement.difficulty === 'unable') {
		flags.push({
			id: 'FLAG-COMMUNITY-001',
			category: 'Community Access',
			message: 'Patient unable to manage community activities - community OT support recommended',
			priority: 'medium'
		});
	}

	// ─── Unable to work ──────────────────────────────────────
	if (data.productivityActivities.paidWork.difficulty === 'unable') {
		flags.push({
			id: 'FLAG-WORK-001',
			category: 'Productivity',
			message: 'Patient unable to perform paid work - vocational rehabilitation referral recommended',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
