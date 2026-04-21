<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const r = assessment.data.referralInfo;
</script>

<SectionCard title="Referral Information" description="Details about the referral and primary diagnosis">
	<TextInput
		label="Referral Source"
		name="referralSource"
		bind:value={r.referralSource}
		placeholder="e.g., GP, Hospital, Self-referral"
		required
	/>

	<TextArea
		label="Reason for Referral"
		name="referralReason"
		bind:value={r.referralReason}
		placeholder="Describe the reason for occupational therapy referral..."
	/>

	<TextInput
		label="Referring Clinician"
		name="referringClinician"
		bind:value={r.referringClinician}
		placeholder="Name of referring clinician"
	/>

	<TextInput
		label="Referral Date"
		name="referralDate"
		type="date"
		bind:value={r.referralDate}
	/>

	<TextInput
		label="Primary Diagnosis"
		name="primaryDiagnosis"
		bind:value={r.primaryDiagnosis}
		placeholder="e.g., Stroke, Hip fracture, Multiple sclerosis"
		required
	/>
</SectionCard>
