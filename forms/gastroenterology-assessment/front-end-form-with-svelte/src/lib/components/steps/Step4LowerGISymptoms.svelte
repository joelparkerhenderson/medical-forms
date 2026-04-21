<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { bristolStoolDescription } from '$lib/engine/utils';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const l = assessment.data.lowerGISymptoms;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Lower GI Symptoms" description="Symptoms affecting the bowel and rectum">
	<RadioGroup label="Have you noticed a change in your bowel habit?" name="bowelChange" options={yesNo} bind:value={l.bowelHabitChange} />
	{#if l.bowelHabitChange === 'yes'}
		<TextArea label="Please describe the change" name="bowelDetails" bind:value={l.bowelHabitDetails} />
	{/if}

	<RadioGroup label="Do you have diarrhoea?" name="diarrhoea" options={yesNo} bind:value={l.diarrhoea} />
	{#if l.diarrhoea === 'yes'}
		<TextInput label="How often?" name="diarrhoeaFrequency" bind:value={l.diarrhoeaFrequency} placeholder="e.g. 5 times per day" />
	{/if}

	<RadioGroup label="Do you have constipation?" name="constipation" options={yesNo} bind:value={l.constipation} />
	{#if l.constipation === 'yes'}
		<TextInput label="Please describe" name="constipationDetails" bind:value={l.constipationDetails} placeholder="e.g. once per week" />
	{/if}

	<RadioGroup label="Have you noticed any rectal bleeding?" name="rectalBleeding" options={yesNo} bind:value={l.rectalBleeding} />
	{#if l.rectalBleeding === 'yes'}
		<TextArea label="Describe the bleeding (colour, amount, frequency)" name="bleedingDetails" bind:value={l.rectalBleedingDetails} />
	{/if}

	<RadioGroup label="Do you have a feeling of incomplete evacuation (tenesmus)?" name="tenesmus" options={yesNo} bind:value={l.tenesmus} />

	<SelectInput
		label="Bristol Stool Scale - What best describes your usual stool?"
		name="bristolStool"
		options={[
			{ value: '1', label: 'Type 1 - Separate hard lumps' },
			{ value: '2', label: 'Type 2 - Lumpy, sausage-shaped' },
			{ value: '3', label: 'Type 3 - Sausage with cracks' },
			{ value: '4', label: 'Type 4 - Smooth, soft sausage' },
			{ value: '5', label: 'Type 5 - Soft blobs with clear edges' },
			{ value: '6', label: 'Type 6 - Fluffy, mushy pieces' },
			{ value: '7', label: 'Type 7 - Entirely liquid' }
		]}
		bind:value={l.bristolStoolType}
	/>
	{#if l.bristolStoolType}
		<p class="mt-[-12px] mb-4 text-xs text-gray-500">{bristolStoolDescription(l.bristolStoolType)}</p>
	{/if}
</SectionCard>
