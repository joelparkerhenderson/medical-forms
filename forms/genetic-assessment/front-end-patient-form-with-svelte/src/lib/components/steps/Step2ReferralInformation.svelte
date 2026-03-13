<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const r = assessment.data.referralInformation;
</script>

<SectionCard title="Referral Information" description="Details about the genetic counseling referral">
	<TextArea
		label="Reason for referral"
		name="referralReason"
		bind:value={r.referralReason}
		placeholder="Describe the reason for genetic assessment referral..."
		rows={4}
	/>

	<TextInput
		label="Referring clinician"
		name="referringClinician"
		bind:value={r.referringClinician}
		placeholder="Name of the referring doctor or specialist"
		required
	/>

	<RadioGroup
		label="Urgency"
		name="urgency"
		options={[
			{ value: 'routine', label: 'Routine' },
			{ value: 'urgent', label: 'Urgent' },
			{ value: 'emergency', label: 'Emergency' }
		]}
		bind:value={r.urgency}
		required
	/>
</SectionCard>
