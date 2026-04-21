<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateMMSE } from '$lib/engine/mmse-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ReferralInfo from '$lib/components/steps/Step2ReferralInfo.svelte';
	import Step3Orientation from '$lib/components/steps/Step3Orientation.svelte';
	import Step4Registration from '$lib/components/steps/Step4Registration.svelte';
	import Step5AttentionCalculation from '$lib/components/steps/Step5AttentionCalculation.svelte';
	import Step6Recall from '$lib/components/steps/Step6Recall.svelte';
	import Step7Language from '$lib/components/steps/Step7Language.svelte';
	import Step8RepetitionCommands from '$lib/components/steps/Step8RepetitionCommands.svelte';
	import Step9Visuospatial from '$lib/components/steps/Step9Visuospatial.svelte';
	import Step10FunctionalHistory from '$lib/components/steps/Step10FunctionalHistory.svelte';

	function submitAssessment() {
			const { mmseScore, mmseCategoryLabel, firedRules } = calculateMMSE(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				mmseScore,
				mmseCategory: mmseCategoryLabel,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ReferralInfo />

<Step3Orientation />

<Step4Registration />

<Step5AttentionCalculation />

<Step6Recall />

<Step7Language />

<Step8RepetitionCommands />

<Step9Visuospatial />

<Step10FunctionalHistory />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
