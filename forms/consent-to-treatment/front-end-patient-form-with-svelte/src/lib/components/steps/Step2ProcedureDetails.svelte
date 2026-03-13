<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const p = assessment.data.procedureDetails;
</script>

<SectionCard title="Procedure Details" description="Information about the planned procedure">
	<TextInput label="Procedure Name" name="procedureName" bind:value={p.procedureName} required />

	<TextArea
		label="Procedure Description"
		name="procedureDescription"
		bind:value={p.procedureDescription}
		placeholder="Describe the procedure in terms the patient can understand..."
		rows={4}
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Treating Clinician" name="treatingClinician" bind:value={p.treatingClinician} required />
		<TextInput label="Department" name="department" bind:value={p.department} required />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Scheduled Date" name="scheduledDate" type="date" bind:value={p.scheduledDate} required />
		<TextInput label="Estimated Duration" name="estimatedDuration" bind:value={p.estimatedDuration} placeholder="e.g., 1-2 hours" />
	</div>

	<RadioGroup
		label="Admission Required"
		name="admissionRequired"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={p.admissionRequired}
		required
	/>
</SectionCard>
