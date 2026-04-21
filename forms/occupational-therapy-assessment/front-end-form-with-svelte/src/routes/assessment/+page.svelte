<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateCOPM } from '$lib/engine/copm-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ReferralInfo from '$lib/components/steps/Step2ReferralInfo.svelte';
	import Step3SelfCareActivities from '$lib/components/steps/Step3SelfCareActivities.svelte';
	import Step4ProductivityActivities from '$lib/components/steps/Step4ProductivityActivities.svelte';
	import Step5LeisureActivities from '$lib/components/steps/Step5LeisureActivities.svelte';
	import Step6PerformanceRatings from '$lib/components/steps/Step6PerformanceRatings.svelte';
	import Step7SatisfactionRatings from '$lib/components/steps/Step7SatisfactionRatings.svelte';
	import Step8EnvironmentalFactors from '$lib/components/steps/Step8EnvironmentalFactors.svelte';
	import Step9PhysicalCognitiveStatus from '$lib/components/steps/Step9PhysicalCognitiveStatus.svelte';
	import Step10GoalsPriorities from '$lib/components/steps/Step10GoalsPriorities.svelte';

	function submitAssessment() {
			const { performanceScore, satisfactionScore, performanceCategoryLabel, satisfactionCategoryLabel, firedRules } = calculateCOPM(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				performanceScore,
				satisfactionScore,
				performanceCategory: performanceCategoryLabel,
				satisfactionCategory: satisfactionCategoryLabel,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ReferralInfo />

<Step3SelfCareActivities />

<Step4ProductivityActivities />

<Step5LeisureActivities />

<Step6PerformanceRatings />

<Step7SatisfactionRatings />

<Step8EnvironmentalFactors />

<Step9PhysicalCognitiveStatus />

<Step10GoalsPriorities />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
