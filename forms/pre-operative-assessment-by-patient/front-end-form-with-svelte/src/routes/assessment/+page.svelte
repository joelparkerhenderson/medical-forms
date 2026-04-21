<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateASA } from '$lib/engine/asa-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2Cardiovascular from '$lib/components/steps/Step2Cardiovascular.svelte';
	import Step3Respiratory from '$lib/components/steps/Step3Respiratory.svelte';
	import Step4Renal from '$lib/components/steps/Step4Renal.svelte';
	import Step5Hepatic from '$lib/components/steps/Step5Hepatic.svelte';
	import Step6Endocrine from '$lib/components/steps/Step6Endocrine.svelte';
	import Step7Neurological from '$lib/components/steps/Step7Neurological.svelte';
	import Step8Haematological from '$lib/components/steps/Step8Haematological.svelte';
	import Step9MusculoskeletalAirway from '$lib/components/steps/Step9MusculoskeletalAirway.svelte';
	import Step10Gastrointestinal from '$lib/components/steps/Step10Gastrointestinal.svelte';
	import Step11Medications from '$lib/components/steps/Step11Medications.svelte';
	import Step12Allergies from '$lib/components/steps/Step12Allergies.svelte';
	import Step13PreviousAnaesthesia from '$lib/components/steps/Step13PreviousAnaesthesia.svelte';
	import Step14SocialHistory from '$lib/components/steps/Step14SocialHistory.svelte';
	import Step15FunctionalCapacity from '$lib/components/steps/Step15FunctionalCapacity.svelte';
	import Step16Pregnancy from '$lib/components/steps/Step16Pregnancy.svelte';

	function submitAssessment() {
			const { asaGrade, firedRules } = calculateASA(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				asaGrade,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2Cardiovascular />

<Step3Respiratory />

<Step4Renal />

<Step5Hepatic />

<Step6Endocrine />

<Step7Neurological />

<Step8Haematological />

<Step9MusculoskeletalAirway />

<Step10Gastrointestinal />

<Step11Medications />

<Step12Allergies />

<Step13PreviousAnaesthesia />

<Step14SocialHistory />

<Step15FunctionalCapacity />

<Step16Pregnancy />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
