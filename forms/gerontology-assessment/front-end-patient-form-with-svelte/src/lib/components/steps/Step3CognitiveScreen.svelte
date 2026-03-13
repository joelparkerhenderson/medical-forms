<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const c = assessment.data.cognitiveScreen;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Cognitive Screen" description="Cognitive function assessment including MMSE/MoCA, orientation, memory, and delirium risk">
	<NumberInput label="MMSE Score" name="mmseScore" bind:value={c.mmseScore} min={0} max={30} />
	<NumberInput label="MoCA Score" name="mocaScore" bind:value={c.mocaScore} min={0} max={30} />

	<RadioGroup label="Is orientation intact (person, place, time)?" name="orientation" options={yesNo} bind:value={c.orientationIntact} />
	<RadioGroup label="Is there any memory impairment?" name="memoryImpairment" options={yesNo} bind:value={c.memoryImpairment} />
	<RadioGroup label="Is there any executive function impairment?" name="execFunction" options={yesNo} bind:value={c.executiveFunctionImpairment} />
	<RadioGroup label="Is there a risk of delirium?" name="deliriumRisk" options={yesNo} bind:value={c.deliriumRisk} />

	<SelectInput
		label="Overall Cognitive Status"
		name="cognitiveStatus"
		options={[
			{ value: 'normal', label: 'Normal' },
			{ value: 'mild-impairment', label: 'Mild Cognitive Impairment' },
			{ value: 'moderate-impairment', label: 'Moderate Cognitive Impairment' },
			{ value: 'severe-impairment', label: 'Severe Cognitive Impairment' }
		]}
		bind:value={c.cognitiveStatus}
		required
	/>
</SectionCard>
