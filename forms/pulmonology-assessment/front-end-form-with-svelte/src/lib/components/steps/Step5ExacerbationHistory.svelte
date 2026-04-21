<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const e = assessment.data.exacerbationHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Exacerbation History" description="History of COPD exacerbations in the past 12 months">
	<NumberInput
		label="Number of exacerbations per year"
		name="exacPerYear"
		bind:value={e.exacerbationsPerYear}
		min={0}
		max={50}
	/>

	<NumberInput
		label="Number of hospitalisations for exacerbation per year"
		name="hospPerYear"
		bind:value={e.hospitalizationsPerYear}
		min={0}
		max={20}
	/>

	<NumberInput
		label="Number of ICU admissions"
		name="icuAdmissions"
		bind:value={e.icuAdmissions}
		min={0}
		max={20}
	/>

	<RadioGroup
		label="Have you ever been intubated (placed on a ventilator) for a breathing crisis?"
		name="intubation"
		options={yesNo}
		bind:value={e.intubationHistory}
	/>
</SectionCard>
