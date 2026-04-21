<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const s = assessment.data.symptomAssessment;
</script>

<SectionCard title="Symptom Assessment" description="COPD symptom severity evaluation">
	<NumberInput
		label="CAT Score (COPD Assessment Test)"
		name="catScore"
		bind:value={s.catScore}
		min={0}
		max={40}
	/>
	{#if s.catScore !== null}
		<div class="mb-4 -mt-2 text-sm text-gray-500">
			{#if s.catScore < 10}
				Low impact
			{:else if s.catScore < 20}
				Medium impact
			{:else if s.catScore < 30}
				High impact
			{:else}
				Very high impact
			{/if}
		</div>
	{/if}

	<SelectInput
		label="mMRC Dyspnoea Scale"
		name="mmrc"
		options={[
			{ value: '0', label: '0 - Breathless with strenuous exercise only' },
			{ value: '1', label: '1 - Short of breath when hurrying or walking up a slight hill' },
			{ value: '2', label: '2 - Walks slower than people of same age or stops for breath' },
			{ value: '3', label: '3 - Stops for breath after about 100 yards or a few minutes' },
			{ value: '4', label: '4 - Too breathless to leave the house or breathless when dressing' }
		]}
		bind:value={s.mmrcDyspnoea}
	/>

	<SelectInput
		label="Cough frequency"
		name="coughFreq"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'occasional', label: 'Occasional' },
			{ value: 'daily', label: 'Daily' },
			{ value: 'persistent', label: 'Persistent throughout the day' }
		]}
		bind:value={s.coughFrequency}
	/>

	<SelectInput
		label="Sputum production"
		name="sputum"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'occasional', label: 'Occasional' },
			{ value: 'daily', label: 'Daily' },
			{ value: 'copious', label: 'Copious / large amounts' }
		]}
		bind:value={s.sputumProduction}
	/>
</SectionCard>
