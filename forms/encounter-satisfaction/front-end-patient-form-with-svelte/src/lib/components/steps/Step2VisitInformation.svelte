<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const v = assessment.data.visitInformation;
</script>

<SectionCard title="Visit Information" description="Details about your recent healthcare visit">
	<TextInput label="Visit Date" name="visitDate" type="date" bind:value={v.visitDate} required />

	<TextInput label="Department / Clinic" name="department" bind:value={v.department} placeholder="e.g. Primary Care, Cardiology" required />

	<TextInput label="Provider Name" name="providerName" bind:value={v.providerName} placeholder="e.g. Dr. Smith" required />

	<SelectInput
		label="Visit Type"
		name="visitType"
		options={[
			{ value: 'routine-checkup', label: 'Routine Check-up' },
			{ value: 'follow-up', label: 'Follow-up Visit' },
			{ value: 'urgent-care', label: 'Urgent Care' },
			{ value: 'specialist-referral', label: 'Specialist Referral' },
			{ value: 'procedure', label: 'Procedure' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={v.visitType}
		required
	/>

	<TextArea label="Reason for Visit" name="reasonForVisit" bind:value={v.reasonForVisit} placeholder="Briefly describe the reason for your visit" />

	<RadioGroup
		label="Was this your first visit to this provider?"
		name="firstVisit"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={v.firstVisit}
		required
	/>
</SectionCard>
