<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateACT } from '$lib/engine/act-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2SymptomFrequency from '$lib/components/steps/Step2SymptomFrequency.svelte';
	import Step3LungFunction from '$lib/components/steps/Step3LungFunction.svelte';
	import Step4Triggers from '$lib/components/steps/Step4Triggers.svelte';
	import Step5CurrentMedications from '$lib/components/steps/Step5CurrentMedications.svelte';
	import Step6Allergies from '$lib/components/steps/Step6Allergies.svelte';
	import Step7ExacerbationHistory from '$lib/components/steps/Step7ExacerbationHistory.svelte';
	import Step8Comorbidities from '$lib/components/steps/Step8Comorbidities.svelte';
	import Step9SocialHistory from '$lib/components/steps/Step9SocialHistory.svelte';

	function submitAssessment() {
			const { actScore, controlLevel, firedRules } = calculateACT(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				actScore,
				controlLevel,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2SymptomFrequency />

<Step3LungFunction />

<Step4Triggers />

<Step5CurrentMedications />

<Step6Allergies />

<Step7ExacerbationHistory />

<Step8Comorbidities />

<Step9SocialHistory />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
