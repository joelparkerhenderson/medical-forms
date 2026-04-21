<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const m = assessment.data.moodAndAnxiety;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Mood & Anxiety" description="Standardised screening scores and symptom assessment">
	<NumberInput label="PHQ-9 Score (brief depression screen)" name="phq9" bind:value={m.phq9Score} min={0} max={27} />
	<p class="mb-4 -mt-2 text-xs text-gray-500">0-4 minimal, 5-9 mild, 10-14 moderate, 15-19 moderately severe, 20-27 severe</p>

	<NumberInput label="GAD-7 Score (brief anxiety screen)" name="gad7" bind:value={m.gad7Score} min={0} max={21} />
	<p class="mb-4 -mt-2 text-xs text-gray-500">0-4 minimal, 5-9 mild, 10-14 moderate, 15-21 severe</p>

	<RadioGroup label="Mania screen positive?" name="mania" options={yesNo} bind:value={m.maniaScreen} />
	{#if m.maniaScreen === 'yes'}
		<TextArea label="Mania Details" name="maniaDetails" bind:value={m.maniaDetails} placeholder="Elevated mood, decreased sleep, grandiosity, pressured speech" />
	{/if}

	<RadioGroup label="Psychotic symptoms present?" name="psychotic" options={yesNo} bind:value={m.psychoticSymptoms} />
	{#if m.psychoticSymptoms === 'yes'}
		<TextArea label="Psychotic Symptom Details" name="psychoticDetails" bind:value={m.psychoticDetails} placeholder="Hallucinations, delusions, thought disorder, catatonia" />
	{/if}
</SectionCard>
