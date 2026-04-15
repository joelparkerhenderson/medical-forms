<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateHHIES } from '$lib/engine/hhies-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import { hhiesCategory } from '$lib/engine/utils';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2HearingHistory from '$lib/components/steps/Step2HearingHistory.svelte';
	import Step3HHIESQuestionnaire from '$lib/components/steps/Step3HHIESQuestionnaire.svelte';
	import Step4CommunicationDifficulties from '$lib/components/steps/Step4CommunicationDifficulties.svelte';
	import Step5CurrentHearingAids from '$lib/components/steps/Step5CurrentHearingAids.svelte';
	import Step6EarExamination from '$lib/components/steps/Step6EarExamination.svelte';
	import Step7AudiogramResults from '$lib/components/steps/Step7AudiogramResults.svelte';
	import Step8LifestyleNeeds from '$lib/components/steps/Step8LifestyleNeeds.svelte';
	import Step9ExpectationsGoals from '$lib/components/steps/Step9ExpectationsGoals.svelte';

	function submitAssessment() {
			const { hhiesScore, hhiesCategoryLabel, firedRules } = calculateHHIES(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				hhiesScore,
				hhiesCategory: hhiesCategoryLabel,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2HearingHistory />

<Step3HHIESQuestionnaire />

<Step4CommunicationDifficulties />

<Step5CurrentHearingAids />

<Step6EarExamination />

<Step7AudiogramResults />

<Step8LifestyleNeeds />

<Step9ExpectationsGoals />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
