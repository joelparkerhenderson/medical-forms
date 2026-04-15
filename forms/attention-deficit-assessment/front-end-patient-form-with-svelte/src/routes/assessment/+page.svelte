<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateASRS } from '$lib/engine/asrs-grader';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ASRSPartA from '$lib/components/steps/Step2ASRSPartA.svelte';
	import Step3ASRSPartB from '$lib/components/steps/Step3ASRSPartB.svelte';
	import Step4ChildhoodHistory from '$lib/components/steps/Step4ChildhoodHistory.svelte';
	import Step5FunctionalImpact from '$lib/components/steps/Step5FunctionalImpact.svelte';
	import Step6ComorbidConditions from '$lib/components/steps/Step6ComorbidConditions.svelte';
	import Step7Medications from '$lib/components/steps/Step7Medications.svelte';
	import Step8Allergies from '$lib/components/steps/Step8Allergies.svelte';
	import Step9MedicalHistory from '$lib/components/steps/Step9MedicalHistory.svelte';
	import Step10SocialSupport from '$lib/components/steps/Step10SocialSupport.svelte';

	function submitAssessment() {
			const result = calculateASRS(assessment.data);
			assessment.result = result;
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ASRSPartA />

<Step3ASRSPartB />

<Step4ChildhoodHistory />

<Step5FunctionalImpact />

<Step6ComorbidConditions />

<Step7Medications />

<Step8Allergies />

<Step9MedicalHistory />

<Step10SocialSupport />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
