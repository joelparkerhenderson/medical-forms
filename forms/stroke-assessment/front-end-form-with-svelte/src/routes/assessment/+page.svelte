<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateNIHSS } from '$lib/engine/nihss-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import { nihssCategory } from '$lib/engine/utils';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2SymptomOnset from '$lib/components/steps/Step2SymptomOnset.svelte';
	import Step3LevelOfConsciousness from '$lib/components/steps/Step3LevelOfConsciousness.svelte';
	import Step4BestGazeVisual from '$lib/components/steps/Step4BestGazeVisual.svelte';
	import Step5FacialPalsyMotor from '$lib/components/steps/Step5FacialPalsyMotor.svelte';
	import Step6LimbAtaxiaSensory from '$lib/components/steps/Step6LimbAtaxiaSensory.svelte';
	import Step7LanguageDysarthria from '$lib/components/steps/Step7LanguageDysarthria.svelte';
	import Step8ExtinctionInattention from '$lib/components/steps/Step8ExtinctionInattention.svelte';
	import Step9RiskFactors from '$lib/components/steps/Step9RiskFactors.svelte';
	import Step10CurrentMedications from '$lib/components/steps/Step10CurrentMedications.svelte';

	function submitAssessment() {
			const { nihssScore, nihssCategoryLabel, firedRules } = calculateNIHSS(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				nihssScore,
				nihssCategory: nihssCategoryLabel,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2SymptomOnset />

<Step3LevelOfConsciousness />

<Step4BestGazeVisual />

<Step5FacialPalsyMotor />

<Step6LimbAtaxiaSensory />

<Step7LanguageDysarthria />

<Step8ExtinctionInattention />

<Step9RiskFactors />

<Step10CurrentMedications />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
