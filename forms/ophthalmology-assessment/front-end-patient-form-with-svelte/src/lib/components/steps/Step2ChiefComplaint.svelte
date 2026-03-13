<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const c = assessment.data.chiefComplaint;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Chief Complaint" description="Primary eye concern and symptom details">
	<TextArea label="What is your primary eye concern?" name="primaryConcern" bind:value={c.primaryConcern} placeholder="Describe your main eye problem or reason for visit" required />

	<RadioGroup
		label="Which eye is affected?"
		name="affectedEye"
		options={[
			{ value: 'left', label: 'Left' },
			{ value: 'right', label: 'Right' },
			{ value: 'both', label: 'Both' }
		]}
		bind:value={c.affectedEye}
		required
	/>

	<RadioGroup
		label="How did the symptoms start?"
		name="onsetType"
		options={[
			{ value: 'sudden', label: 'Sudden' },
			{ value: 'gradual', label: 'Gradual' }
		]}
		bind:value={c.onsetType}
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Duration" name="durationValue" bind:value={c.durationValue} placeholder="e.g. 3" />
		<SelectInput
			label="Duration unit"
			name="durationUnit"
			options={[
				{ value: 'hours', label: 'Hours' },
				{ value: 'days', label: 'Days' },
				{ value: 'weeks', label: 'Weeks' },
				{ value: 'months', label: 'Months' },
				{ value: 'years', label: 'Years' }
			]}
			bind:value={c.durationUnit}
		/>
	</div>

	<RadioGroup label="Is there any eye pain?" name="painPresent" options={yesNo} bind:value={c.painPresent} />
	{#if c.painPresent === 'yes'}
		<SelectInput
			label="Pain severity (1-10)"
			name="painSeverity"
			options={[
				{ value: '1', label: '1 - Minimal' },
				{ value: '2', label: '2' },
				{ value: '3', label: '3' },
				{ value: '4', label: '4' },
				{ value: '5', label: '5 - Moderate' },
				{ value: '6', label: '6' },
				{ value: '7', label: '7' },
				{ value: '8', label: '8' },
				{ value: '9', label: '9' },
				{ value: '10', label: '10 - Worst possible' }
			]}
			bind:value={c.painSeverity}
		/>
	{/if}
</SectionCard>
