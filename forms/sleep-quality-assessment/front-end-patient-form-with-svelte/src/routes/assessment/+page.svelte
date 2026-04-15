<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculatePSQI } from '$lib/engine/psqi-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2SleepHabits from '$lib/components/steps/Step2SleepHabits.svelte';
	import Step3SleepLatency from '$lib/components/steps/Step3SleepLatency.svelte';
	import Step4SleepDuration from '$lib/components/steps/Step4SleepDuration.svelte';
	import Step5SleepEfficiency from '$lib/components/steps/Step5SleepEfficiency.svelte';
	import Step6SleepDisturbances from '$lib/components/steps/Step6SleepDisturbances.svelte';
	import Step7DaytimeDysfunction from '$lib/components/steps/Step7DaytimeDysfunction.svelte';
	import Step8SleepMedicationUse from '$lib/components/steps/Step8SleepMedicationUse.svelte';
	import Step9MedicalLifestyle from '$lib/components/steps/Step9MedicalLifestyle.svelte';

	function submitAssessment() {
			const { psqiScore, psqiCategoryLabel, firedRules } = calculatePSQI(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				psqiScore,
				psqiCategory: psqiCategoryLabel,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2SleepHabits />

<Step3SleepLatency />

<Step4SleepDuration />

<Step5SleepEfficiency />

<Step6SleepDisturbances />

<Step7DaytimeDysfunction />

<Step8SleepMedicationUse />

<Step9MedicalLifestyle />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
