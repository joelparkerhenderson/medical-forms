<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import { calculateNEWS2 } from '$lib/engine/news2-calculator';
	import { detectFlaggedIssues } from '$lib/engine/flagged-issues';

	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2NextOfKinGP from '$lib/components/steps/Step2NextOfKinGP.svelte';
	import Step3ArrivalTriage from '$lib/components/steps/Step3ArrivalTriage.svelte';
	import Step4PresentingComplaint from '$lib/components/steps/Step4PresentingComplaint.svelte';
	import Step5PainAssessment from '$lib/components/steps/Step5PainAssessment.svelte';
	import Step6MedicalHistory from '$lib/components/steps/Step6MedicalHistory.svelte';
	import Step7VitalSigns from '$lib/components/steps/Step7VitalSigns.svelte';
	import Step8PrimarySurvey from '$lib/components/steps/Step8PrimarySurvey.svelte';
	import Step9ClinicalExamination from '$lib/components/steps/Step9ClinicalExamination.svelte';
	import Step10Investigations from '$lib/components/steps/Step10Investigations.svelte';
	import Step11Treatment from '$lib/components/steps/Step11Treatment.svelte';
	import Step12AssessmentPlan from '$lib/components/steps/Step12AssessmentPlan.svelte';
	import Step13Disposition from '$lib/components/steps/Step13Disposition.svelte';
	import Step14SafeguardingConsent from '$lib/components/steps/Step14SafeguardingConsent.svelte';

	function submitAssessment() {
			const news2 = calculateNEWS2(casualtyCard.data.vitalSigns);
			const flaggedIssues = detectFlaggedIssues(casualtyCard.data, news2);
			casualtyCard.result = {
				news2,
				flaggedIssues,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1Demographics />

<Step2NextOfKinGP />

<Step3ArrivalTriage />

<Step4PresentingComplaint />

<Step5PainAssessment />

<Step6MedicalHistory />

<Step7VitalSigns />

<Step8PrimarySurvey />

<Step9ClinicalExamination />

<Step10Investigations />

<Step11Treatment />

<Step12AssessmentPlan />

<Step13Disposition />

<Step14SafeguardingConsent />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitAssessment}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
