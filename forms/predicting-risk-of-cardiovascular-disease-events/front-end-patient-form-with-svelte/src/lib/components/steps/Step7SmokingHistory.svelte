<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const sh = assessment.data.smokingHistory;
</script>

<SectionCard title="Smoking History" description="Smoking status is a major modifiable CVD risk factor">
	<SelectInput
		label="Smoking Status"
		name="smokingStatus"
		options={[
			{ value: 'never', label: 'Never smoked' },
			{ value: 'current', label: 'Current smoker' },
			{ value: 'former', label: 'Former smoker' }
		]}
		bind:value={sh.smokingStatus}
		required
	/>

	{#if sh.smokingStatus === 'current'}
		<NumberInput label="Cigarettes per day" name="cigarettesPerDay" bind:value={sh.cigarettesPerDay} min={1} max={100} />
		<NumberInput label="Years smoked" name="yearsSmoked" bind:value={sh.yearsSmoked} min={1} max={80} unit="years" />
	{/if}

	{#if sh.smokingStatus === 'former'}
		<NumberInput label="Years smoked" name="yearsSmokedFormer" bind:value={sh.yearsSmoked} min={1} max={80} unit="years" />
		<NumberInput label="Years since quit" name="yearsSinceQuit" bind:value={sh.yearsSinceQuit} min={0} max={80} unit="years" />
	{/if}
</SectionCard>
