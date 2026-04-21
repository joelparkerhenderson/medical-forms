<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateIPSS } from '$lib/engine/ipss-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import { ipssCategory } from '$lib/engine/utils';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ChiefComplaint from '$lib/components/steps/Step2ChiefComplaint.svelte';
	import Step3IPSSQuestionnaire from '$lib/components/steps/Step3IPSSQuestionnaire.svelte';
	import Step4QualityOfLife from '$lib/components/steps/Step4QualityOfLife.svelte';
	import Step5UrinarySymptoms from '$lib/components/steps/Step5UrinarySymptoms.svelte';
	import Step6RenalFunction from '$lib/components/steps/Step6RenalFunction.svelte';
	import Step7SexualHealth from '$lib/components/steps/Step7SexualHealth.svelte';
	import Step8MedicalHistory from '$lib/components/steps/Step8MedicalHistory.svelte';
	import Step9CurrentMedications from '$lib/components/steps/Step9CurrentMedications.svelte';
	import Step10FamilyHistory from '$lib/components/steps/Step10FamilyHistory.svelte';

	function submitAssessment() {
			const { ipssScore, ipssCategoryLabel, firedRules } = calculateIPSS(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				ipssScore,
				ipssCategory: ipssCategoryLabel,
				qolScore: assessment.data.qualityOfLife.qolScore,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ChiefComplaint />

<Step3IPSSQuestionnaire />

<Step4QualityOfLife />

<Step5UrinarySymptoms />

<Step6RenalFunction />

<Step7SexualHealth />

<Step8MedicalHistory />

<Step9CurrentMedications />

<Step10FamilyHistory />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
