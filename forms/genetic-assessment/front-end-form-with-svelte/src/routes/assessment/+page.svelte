<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateRisk } from '$lib/engine/risk-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2ReferralInformation from '$lib/components/steps/Step2ReferralInformation.svelte';
	import Step3PersonalMedicalHistory from '$lib/components/steps/Step3PersonalMedicalHistory.svelte';
	import Step4CancerHistory from '$lib/components/steps/Step4CancerHistory.svelte';
	import Step5FamilyPedigree from '$lib/components/steps/Step5FamilyPedigree.svelte';
	import Step6CardiovascularGenetics from '$lib/components/steps/Step6CardiovascularGenetics.svelte';
	import Step7Neurogenetics from '$lib/components/steps/Step7Neurogenetics.svelte';
	import Step8ReproductiveGenetics from '$lib/components/steps/Step8ReproductiveGenetics.svelte';
	import Step9EthnicBackground from '$lib/components/steps/Step9EthnicBackground.svelte';
	import Step10GeneticTestingHistory from '$lib/components/steps/Step10GeneticTestingHistory.svelte';

	function submitAssessment() {
			const { riskScore, riskLevel, firedRules } = calculateRisk(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				riskScore,
				riskLevel,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2ReferralInformation />

<Step3PersonalMedicalHistory />

<Step4CancerHistory />

<Step5FamilyPedigree />

<Step6CardiovascularGenetics />

<Step7Neurogenetics />

<Step8ReproductiveGenetics />

<Step9EthnicBackground />

<Step10GeneticTestingHistory />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
