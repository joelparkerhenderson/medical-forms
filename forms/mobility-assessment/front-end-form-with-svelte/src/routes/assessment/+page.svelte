<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateTinetti } from '$lib/engine/tinetti-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ReferralInfo from '$lib/components/steps/Step2ReferralInfo.svelte';
	import Step3FallHistory from '$lib/components/steps/Step3FallHistory.svelte';
	import Step4BalanceAssessment from '$lib/components/steps/Step4BalanceAssessment.svelte';
	import Step5GaitAssessment from '$lib/components/steps/Step5GaitAssessment.svelte';
	import Step6TimedUpAndGo from '$lib/components/steps/Step6TimedUpAndGo.svelte';
	import Step7RangeOfMotion from '$lib/components/steps/Step7RangeOfMotion.svelte';
	import Step8AssistiveDevices from '$lib/components/steps/Step8AssistiveDevices.svelte';
	import Step9CurrentMedications from '$lib/components/steps/Step9CurrentMedications.svelte';
	import Step10FunctionalIndependence from '$lib/components/steps/Step10FunctionalIndependence.svelte';

	function submitAssessment() {
			const { tinettiTotal, balanceScore, gaitScore, tinettiCategoryLabel, firedRules } = calculateTinetti(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				tinettiTotal,
				balanceScore,
				gaitScore,
				tinettiCategory: tinettiCategoryLabel,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ReferralInfo />

<Step3FallHistory />

<Step4BalanceAssessment />

<Step5GaitAssessment />

<Step6TimedUpAndGo />

<Step7RangeOfMotion />

<Step8AssistiveDevices />

<Step9CurrentMedications />

<Step10FunctionalIndependence />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
