<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateDevelopmentalScreen } from '$lib/engine/dev-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2BirthHistory from '$lib/components/steps/Step2BirthHistory.svelte';
	import Step3GrowthNutrition from '$lib/components/steps/Step3GrowthNutrition.svelte';
	import Step4DevelopmentalMilestones from '$lib/components/steps/Step4DevelopmentalMilestones.svelte';
	import Step5ImmunizationStatus from '$lib/components/steps/Step5ImmunizationStatus.svelte';
	import Step6MedicalHistory from '$lib/components/steps/Step6MedicalHistory.svelte';
	import Step7CurrentMedications from '$lib/components/steps/Step7CurrentMedications.svelte';
	import Step8FamilyHistory from '$lib/components/steps/Step8FamilyHistory.svelte';
	import Step9SocialEnvironmental from '$lib/components/steps/Step9SocialEnvironmental.svelte';

	function submitAssessment() {
			const { overallResult, domainResults, firedRules } = calculateDevelopmentalScreen(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				overallResult,
				domainResults,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2BirthHistory />

<Step3GrowthNutrition />

<Step4DevelopmentalMilestones />

<Step5ImmunizationStatus />

<Step6MedicalHistory />

<Step7CurrentMedications />

<Step8FamilyHistory />

<Step9SocialEnvironmental />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
