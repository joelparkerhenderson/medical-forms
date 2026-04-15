<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateCFS } from '$lib/engine/cfs-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2FunctionalAssessment from '$lib/components/steps/Step2FunctionalAssessment.svelte';
	import Step3CognitiveScreen from '$lib/components/steps/Step3CognitiveScreen.svelte';
	import Step4MobilityFalls from '$lib/components/steps/Step4MobilityFalls.svelte';
	import Step5Nutrition from '$lib/components/steps/Step5Nutrition.svelte';
	import Step6PolypharmacyReview from '$lib/components/steps/Step6PolypharmacyReview.svelte';
	import Step7Comorbidities from '$lib/components/steps/Step7Comorbidities.svelte';
	import Step8Psychosocial from '$lib/components/steps/Step8Psychosocial.svelte';
	import Step9ContinenceSkin from '$lib/components/steps/Step9ContinenceSkin.svelte';

	function submitAssessment() {
			const { cfsScore, firedRules } = calculateCFS(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				cfsScore,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2FunctionalAssessment />

<Step3CognitiveScreen />

<Step4MobilityFalls />

<Step5Nutrition />

<Step6PolypharmacyReview />

<Step7Comorbidities />

<Step8Psychosocial />

<Step9ContinenceSkin />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
