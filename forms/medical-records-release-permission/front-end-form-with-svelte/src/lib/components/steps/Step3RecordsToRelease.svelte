<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { recordTypeOptions } from '$lib/engine/validation-rules';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import CheckboxGroup from '$lib/components/ui/CheckboxGroup.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const r = assessment.data.recordsToRelease;
</script>

<SectionCard title="Records to Release" description="Select the types of medical records to be released">
	<CheckboxGroup
		label="Record Types"
		options={recordTypeOptions}
		bind:values={r.recordTypes}
	/>

	<RadioGroup
		label="Limit to a specific date range?"
		name="specificDateRange"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No - Include all available records' }
		]}
		bind:value={r.specificDateRange}
	/>

	{#if r.specificDateRange === 'yes'}
		<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
			<TextInput
				label="From Date"
				name="dateFrom"
				type="date"
				bind:value={r.dateFrom}
				required
			/>
			<TextInput
				label="To Date"
				name="dateTo"
				type="date"
				bind:value={r.dateTo}
				required
			/>
		</div>
	{/if}

	<TextArea
		label="Specific record details (optional)"
		name="specificRecordDetails"
		bind:value={r.specificRecordDetails}
		placeholder="If you need specific records, provide details here (e.g., specific test results, dates of visits, etc.)"
	/>
</SectionCard>
