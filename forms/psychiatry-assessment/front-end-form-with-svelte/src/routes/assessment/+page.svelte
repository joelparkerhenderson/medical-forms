<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateGAF } from '$lib/engine/gaf-grader';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2PresentingComplaint from '$lib/components/steps/Step2PresentingComplaint.svelte';
	import Step3PsychiatricHistory from '$lib/components/steps/Step3PsychiatricHistory.svelte';
	import Step4MentalStatusExam from '$lib/components/steps/Step4MentalStatusExam.svelte';
	import Step5RiskAssessment from '$lib/components/steps/Step5RiskAssessment.svelte';
	import Step6MoodAndAnxiety from '$lib/components/steps/Step6MoodAndAnxiety.svelte';
	import Step7SubstanceUse from '$lib/components/steps/Step7SubstanceUse.svelte';
	import Step8CurrentMedications from '$lib/components/steps/Step8CurrentMedications.svelte';
	import Step9MedicalHistory from '$lib/components/steps/Step9MedicalHistory.svelte';
	import Step10SocialHistory from '$lib/components/steps/Step10SocialHistory.svelte';
	import Step11CapacityAndConsent from '$lib/components/steps/Step11CapacityAndConsent.svelte';

	function submitAssessment() {
			const { gafScore, firedRules } = calculateGAF(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				gafScore,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2PresentingComplaint />

<Step3PsychiatricHistory />

<Step4MentalStatusExam />

<Step5RiskAssessment />

<Step6MoodAndAnxiety />

<Step7SubstanceUse />

<Step8CurrentMedications />

<Step9MedicalHistory />

<Step10SocialHistory />

<Step11CapacityAndConsent />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
