<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateRiskLevel } from '$lib/engine/intake-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1PersonalInformation from '$lib/components/steps/Step1PersonalInformation.svelte';
	import Step2InsuranceAndId from '$lib/components/steps/Step2InsuranceAndId.svelte';
	import Step3ReasonForVisit from '$lib/components/steps/Step3ReasonForVisit.svelte';
	import Step4MedicalHistory from '$lib/components/steps/Step4MedicalHistory.svelte';
	import Step5Medications from '$lib/components/steps/Step5Medications.svelte';
	import Step6Allergies from '$lib/components/steps/Step6Allergies.svelte';
	import Step7FamilyHistory from '$lib/components/steps/Step7FamilyHistory.svelte';
	import Step8SocialHistory from '$lib/components/steps/Step8SocialHistory.svelte';
	import Step9ReviewOfSystems from '$lib/components/steps/Step9ReviewOfSystems.svelte';
	import Step10ConsentAndPreferences from '$lib/components/steps/Step10ConsentAndPreferences.svelte';

	function submitAssessment() {
			const { riskLevel, firedRules } = calculateRiskLevel(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				riskLevel,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1PersonalInformation />

<Step2InsuranceAndId />

<Step3ReasonForVisit />

<Step4MedicalHistory />

<Step5Medications />

<Step6Allergies />

<Step7FamilyHistory />

<Step8SocialHistory />

<Step9ReviewOfSystems />

<Step10ConsentAndPreferences />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
