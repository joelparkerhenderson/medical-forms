<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const s = assessment.data.symptomAssessment;

	const severityOptions = [
		{ value: 'none', label: 'None' },
		{ value: 'mild', label: 'Mild' },
		{ value: 'moderate', label: 'Moderate' },
		{ value: 'severe', label: 'Severe' }
	];
</script>

<SectionCard title="Symptom Assessment" description="Current symptoms and severity">
	<NumberInput label="Pain (NRS 0-10)" name="painNRS" bind:value={s.painNRS} min={0} max={10} step={1} />
	<p class="mt-[-12px] mb-4 text-xs text-gray-500">0 = no pain, 10 = worst pain imaginable</p>

	<SelectInput label="Fatigue" name="fatigue" options={severityOptions} bind:value={s.fatigue} />

	<SelectInput label="Nausea" name="nausea" options={severityOptions} bind:value={s.nausea} />

	<SelectInput
		label="Appetite"
		name="appetite"
		options={[
			{ value: 'normal', label: 'Normal' },
			{ value: 'decreased', label: 'Decreased' },
			{ value: 'severely-decreased', label: 'Severely Decreased' }
		]}
		bind:value={s.appetite}
	/>

	<SelectInput
		label="Weight Change"
		name="weightChange"
		options={[
			{ value: 'stable', label: 'Stable' },
			{ value: 'gaining', label: 'Gaining' },
			{ value: 'losing-less-5', label: 'Losing <5%' },
			{ value: 'losing-5-10', label: 'Losing 5-10%' },
			{ value: 'losing-more-10', label: 'Losing >10%' }
		]}
		bind:value={s.weightChange}
	/>

	<NumberInput label="ESAS Total Score" name="esasScore" bind:value={s.esasScore} min={0} max={100} />
	<p class="mt-[-12px] mb-4 text-xs text-gray-500">Edmonton Symptom Assessment System (0-100)</p>
</SectionCard>
