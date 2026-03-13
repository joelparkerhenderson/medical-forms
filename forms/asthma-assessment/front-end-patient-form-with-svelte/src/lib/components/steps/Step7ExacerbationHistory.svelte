<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const e = assessment.data.exacerbationHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Exacerbation History" description="Asthma flare-ups and emergency care in the past 12 months">
	<NumberInput
		label="Number of exacerbations in the last 12 months"
		name="exacerbationsLastYear"
		bind:value={e.exacerbationsLastYear}
		min={0}
		max={100}
	/>

	<NumberInput
		label="Number of ED (emergency department) visits for asthma in the last 12 months"
		name="edVisitsLastYear"
		bind:value={e.edVisitsLastYear}
		min={0}
		max={100}
	/>

	<NumberInput
		label="Number of hospitalisations for asthma in the last 12 months"
		name="hospitalisationsLastYear"
		bind:value={e.hospitalisationsLastYear}
		min={0}
		max={100}
	/>

	<RadioGroup label="Have you ever been admitted to ICU for asthma?" name="icuAdmissions" options={yesNo} bind:value={e.icuAdmissions} />
	{#if e.icuAdmissions === 'yes'}
		<NumberInput
			label="How many times?"
			name="icuAdmissionCount"
			bind:value={e.icuAdmissionCount}
			min={1}
			max={100}
		/>
	{/if}

	<RadioGroup label="Have you ever been intubated (put on a ventilator) for asthma?" name="intubationHistory" options={yesNo} bind:value={e.intubationHistory} />

	<NumberInput
		label="Number of oral steroid (prednisolone) courses in the last 12 months"
		name="oralSteroidCoursesLastYear"
		bind:value={e.oralSteroidCoursesLastYear}
		min={0}
		max={100}
	/>

	<TextInput
		label="Date of last exacerbation"
		name="lastExacerbationDate"
		type="date"
		bind:value={e.lastExacerbationDate}
	/>
</SectionCard>
