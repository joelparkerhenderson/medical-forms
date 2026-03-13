<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const v = assessment.data.vestibularSymptoms;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Vestibular Symptoms" description="Balance, vertigo, and dizziness">
	<RadioGroup label="Do you experience vertigo (a spinning sensation)?" name="vertigo" options={yesNo} bind:value={v.vertigo} />
	{#if v.vertigo === 'yes'}
		<TextArea label="Describe the vertigo episodes" name="vertigoDetails" bind:value={v.vertigoDetails} placeholder="Frequency, duration, triggers..." />
	{/if}

	<RadioGroup label="Do you experience dizziness?" name="dizziness" options={yesNo} bind:value={v.dizziness} />

	<RadioGroup label="Do you have balance problems?" name="balanceProblems" options={yesNo} bind:value={v.balanceProblems} />

	<RadioGroup label="Dix-Hallpike test positive?" name="dixHallpike" options={yesNo} bind:value={v.dixHallpike} />

	<RadioGroup label="Nystagmus observed?" name="nystagmus" options={yesNo} bind:value={v.nystagmus} />

	<RadioGroup label="Have you had any falls?" name="fallsHistory" options={yesNo} bind:value={v.fallsHistory} />
	{#if v.fallsHistory === 'yes'}
		<TextInput label="How often do falls occur?" name="fallsFrequency" bind:value={v.fallsFrequency} placeholder="e.g., weekly, monthly" />
	{/if}
</SectionCard>
