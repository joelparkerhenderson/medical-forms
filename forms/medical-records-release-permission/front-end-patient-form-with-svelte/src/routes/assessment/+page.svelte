<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { validateForm } from '$lib/engine/form-validator';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';

	import Step1PatientInformation from '$lib/components/steps/Step1PatientInformation.svelte';
	import Step2AuthorizedRecipient from '$lib/components/steps/Step2AuthorizedRecipient.svelte';
	import Step3RecordsToRelease from '$lib/components/steps/Step3RecordsToRelease.svelte';
	import Step4PurposeOfRelease from '$lib/components/steps/Step4PurposeOfRelease.svelte';
	import Step5AuthorizationPeriod from '$lib/components/steps/Step5AuthorizationPeriod.svelte';
	import Step6RestrictionsLimitations from '$lib/components/steps/Step6RestrictionsLimitations.svelte';
	import Step7PatientRights from '$lib/components/steps/Step7PatientRights.svelte';
	import Step8SignatureConsent from '$lib/components/steps/Step8SignatureConsent.svelte';

	function submitForm() {
			const { completenessScore, completenessStatus, validationStatusLabel, firedRules } = validateForm(assessment.data);
			const additionalFlags = detectAdditionalFlags(assessment.data);
			assessment.result = {
				completenessScore,
				completenessStatus,
				validationStatus: validationStatusLabel,
				firedRules,
				additionalFlags,
				timestamp: new Date().toISOString()
			};
			goto('/report');
		}
</script>

<Step1PatientInformation />

<Step2AuthorizedRecipient />

<Step3RecordsToRelease />

<Step4PurposeOfRelease />

<Step5AuthorizationPeriod />

<Step6RestrictionsLimitations />

<Step7PatientRights />

<Step8SignatureConsent />

<div class="mt-8 flex justify-end">
	<button
		type="button"
		onclick={submitForm}
		class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
	>
		Submit
	</button>
</div>
