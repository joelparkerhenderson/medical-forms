<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateValidity } from '$lib/engine/validity-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1PersonalInformation from '$lib/components/steps/Step1PersonalInformation.svelte';
	import Step2CapacityDeclaration from '$lib/components/steps/Step2CapacityDeclaration.svelte';
	import Step3Circumstances from '$lib/components/steps/Step3Circumstances.svelte';
	import Step4TreatmentsRefusedGeneral from '$lib/components/steps/Step4TreatmentsRefusedGeneral.svelte';
	import Step5TreatmentsRefusedLifeSustaining from '$lib/components/steps/Step5TreatmentsRefusedLifeSustaining.svelte';
	import Step6ExceptionsConditions from '$lib/components/steps/Step6ExceptionsConditions.svelte';
	import Step7OtherWishes from '$lib/components/steps/Step7OtherWishes.svelte';
	import Step8LastingPowerOfAttorney from '$lib/components/steps/Step8LastingPowerOfAttorney.svelte';
	import Step9HealthcareProfessionalReview from '$lib/components/steps/Step9HealthcareProfessionalReview.svelte';
	import Step10LegalSignatures from '$lib/components/steps/Step10LegalSignatures.svelte';

	function submitAssessment() {
			const { validityStatus, firedRules } = calculateValidity(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				validityStatus,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1PersonalInformation />

<Step2CapacityDeclaration />

<Step3Circumstances />

<Step4TreatmentsRefusedGeneral />

<Step5TreatmentsRefusedLifeSustaining />

<Step6ExceptionsConditions />

<Step7OtherWishes />

<Step8LastingPowerOfAttorney />

<Step9HealthcareProfessionalReview />

<Step10LegalSignatures />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
