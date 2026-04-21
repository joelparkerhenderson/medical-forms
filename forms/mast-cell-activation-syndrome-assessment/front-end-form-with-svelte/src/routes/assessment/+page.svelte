<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateMCASScore } from '$lib/engine/symptom-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2SymptomOverview from '$lib/components/steps/Step2SymptomOverview.svelte';
	import Step3DermatologicalSymptoms from '$lib/components/steps/Step3DermatologicalSymptoms.svelte';
	import Step4GastrointestinalSymptoms from '$lib/components/steps/Step4GastrointestinalSymptoms.svelte';
	import Step5CardiovascularSymptoms from '$lib/components/steps/Step5CardiovascularSymptoms.svelte';
	import Step6RespiratorySymptoms from '$lib/components/steps/Step6RespiratorySymptoms.svelte';
	import Step7NeurologicalSymptoms from '$lib/components/steps/Step7NeurologicalSymptoms.svelte';
	import Step8TriggersPatterns from '$lib/components/steps/Step8TriggersPatterns.svelte';
	import Step9LaboratoryResults from '$lib/components/steps/Step9LaboratoryResults.svelte';
	import Step10CurrentTreatment from '$lib/components/steps/Step10CurrentTreatment.svelte';

	function submitAssessment() {
			const { symptomScore, mcasCategoryLabel, organSystemsAffected, firedRules } = calculateMCASScore(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				symptomScore,
				mcasCategory: mcasCategoryLabel,
				organSystemsAffected,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2SymptomOverview />

<Step3DermatologicalSymptoms />

<Step4GastrointestinalSymptoms />

<Step5CardiovascularSymptoms />

<Step6RespiratorySymptoms />

<Step7NeurologicalSymptoms />

<Step8TriggersPatterns />

<Step9LaboratoryResults />

<Step10CurrentTreatment />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
