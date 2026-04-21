<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const d = assessment.data.dyspnoeaAssessment;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Dyspnoea Assessment" description="MRC Dyspnoea Scale and related symptoms">
	<SelectInput
		label="MRC Dyspnoea Grade"
		name="mrcGrade"
		options={[
			{ value: '1', label: 'Grade 1 - Breathless only on strenuous exercise' },
			{ value: '2', label: 'Grade 2 - Breathless when hurrying on level / walking up slight hill' },
			{ value: '3', label: 'Grade 3 - Walks slower than peers on level / stops after ~15 min' },
			{ value: '4', label: 'Grade 4 - Stops for breath after ~100 yards on level' },
			{ value: '5', label: 'Grade 5 - Too breathless to leave house / breathless dressing' }
		]}
		bind:value={d.mrcGrade}
		required
	/>

	<TextArea
		label="What triggers your breathlessness?"
		name="triggers"
		bind:value={d.triggers}
		placeholder="e.g. walking, stairs, cold air, exertion..."
	/>

	<NumberInput
		label="Exercise Tolerance"
		name="exerciseTolerance"
		bind:value={d.exerciseToleranceMetres}
		unit="metres on flat before stopping"
		min={0}
		max={10000}
	/>

	<RadioGroup label="Do you experience orthopnoea (breathlessness lying flat)?" name="orthopnoea" options={yesNo} bind:value={d.orthopnoea} />
	{#if d.orthopnoea === 'yes'}
		<NumberInput label="How many pillows do you use to sleep?" name="pillows" bind:value={d.orthopnoeaPillows} min={1} max={10} />
	{/if}

	<RadioGroup label="Do you experience paroxysmal nocturnal dyspnoea (PND)?" name="pnd" options={yesNo} bind:value={d.pnd} />
</SectionCard>
