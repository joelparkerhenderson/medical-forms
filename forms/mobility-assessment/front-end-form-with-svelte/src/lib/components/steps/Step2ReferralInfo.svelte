<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const r = assessment.data.referralInfo;
</script>

<SectionCard title="Referral Information" description="Details about the referral for mobility assessment">
	<TextInput label="Referring Provider" name="referringProvider" bind:value={r.referringProvider} required />
	<TextInput label="Referral Date" name="referralDate" type="date" bind:value={r.referralDate} />

	<TextArea
		label="Reason for Referral"
		name="referralReason"
		bind:value={r.referralReason}
		placeholder="Describe the reason for the mobility assessment referral..."
	/>

	<TextInput label="Primary Diagnosis" name="primaryDiagnosis" bind:value={r.primaryDiagnosis} />

	<TextArea
		label="Secondary Diagnoses"
		name="secondaryDiagnoses"
		bind:value={r.secondaryDiagnoses}
		placeholder="List any secondary diagnoses..."
	/>
</SectionCard>
