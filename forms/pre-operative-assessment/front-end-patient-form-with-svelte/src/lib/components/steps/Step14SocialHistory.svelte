<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const s = assessment.data.socialHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Social History" description="Lifestyle factors relevant to anaesthesia">
	<SelectInput
		label="Alcohol consumption"
		name="alcohol"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'occasional', label: 'Occasional (1-7 units/week)' },
			{ value: 'moderate', label: 'Moderate (8-14 units/week)' },
			{ value: 'heavy', label: 'Heavy (>14 units/week)' }
		]}
		bind:value={s.alcohol}
	/>
	{#if s.alcohol && s.alcohol !== 'none'}
		<NumberInput label="Units per week" name="alcoholUnits" bind:value={s.alcoholUnitsPerWeek} min={0} max={200} />
	{/if}

	<RadioGroup label="Do you use recreational drugs?" name="drugs" options={yesNo} bind:value={s.recreationalDrugs} />
	{#if s.recreationalDrugs === 'yes'}
		<TextInput label="Please provide details (substance, frequency)" name="drugDetails" bind:value={s.drugDetails} />
	{/if}
</SectionCard>
