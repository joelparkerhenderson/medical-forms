<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const r = assessment.data.reasonForVisit;
</script>

<SectionCard title="Reason for Visit" description="Please describe why you are visiting today">
	<TextArea label="Primary Reason for Visit" name="primaryReason" bind:value={r.primaryReason} placeholder="Please describe your main reason for visiting" required />

	<SelectInput
		label="Urgency Level"
		name="urgency"
		options={[
			{ value: 'routine', label: 'Routine' },
			{ value: 'urgent', label: 'Urgent' },
			{ value: 'emergency', label: 'Emergency' }
		]}
		bind:value={r.urgencyLevel}
		required
	/>

	<TextInput label="Referring Provider" name="referrer" bind:value={r.referringProvider} placeholder="If referred by another doctor" />

	<TextInput label="How long have you had these symptoms?" name="symptomDuration" bind:value={r.symptomDuration} placeholder="e.g. 2 weeks, 3 months" />

	<TextArea label="Additional Details" name="additionalDetails" bind:value={r.additionalDetails} placeholder="Any other information you'd like to share" />
</SectionCard>
