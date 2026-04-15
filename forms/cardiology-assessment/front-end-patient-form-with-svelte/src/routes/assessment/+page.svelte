<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateCardioGrade } from '$lib/engine/cardio-grader';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChestPainAngina from '$lib/components/steps/Step2ChestPainAngina.svelte';
	import Step3HeartFailureSymptoms from '$lib/components/steps/Step3HeartFailureSymptoms.svelte';
	import Step4CardiacHistory from '$lib/components/steps/Step4CardiacHistory.svelte';
	import Step5ArrhythmiaConduction from '$lib/components/steps/Step5ArrhythmiaConduction.svelte';
	import Step6RiskFactors from '$lib/components/steps/Step6RiskFactors.svelte';
	import Step7DiagnosticResults from '$lib/components/steps/Step7DiagnosticResults.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9Allergies from '$lib/components/steps/Step9Allergies.svelte';
	import Step10SocialFunctional from '$lib/components/steps/Step10SocialFunctional.svelte';

	function submitAssessment() {
			const result = calculateCardioGrade(assessment.data);
			assessment.result = result;
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ChestPainAngina />

<Step3HeartFailureSymptoms />

<Step4CardiacHistory />

<Step5ArrhythmiaConduction />

<Step6RiskFactors />

<Step7DiagnosticResults />

<Step8CurrentMedications />

<Step9Allergies />

<Step10SocialFunctional />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
