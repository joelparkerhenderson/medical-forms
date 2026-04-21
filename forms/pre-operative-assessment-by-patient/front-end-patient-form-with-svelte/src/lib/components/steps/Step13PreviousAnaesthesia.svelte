<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const p = assessment.data.previousAnaesthesia;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Previous Anaesthesia" description="Your experience with previous anaesthetics">
	<RadioGroup label="Have you had a general anaesthetic before?" name="prevAnaes" options={yesNo} bind:value={p.previousAnaesthesia} />
	{#if p.previousAnaesthesia === 'yes'}
		<RadioGroup label="Were there any problems with the anaesthetic?" name="anaesProblems" options={yesNo} bind:value={p.anaesthesiaProblems} />
		{#if p.anaesthesiaProblems === 'yes'}
			<TextInput label="Please describe the problems" name="anesProbDetails" bind:value={p.anaesthesiaProblemDetails} />
		{/if}
	{/if}

	<RadioGroup label="Has anyone in your family had problems with anaesthesia (malignant hyperthermia)?" name="mhHistory" options={yesNo} bind:value={p.familyMHHistory} />
	{#if p.familyMHHistory === 'yes'}
		<TextInput label="Please provide details" name="mhDetails" bind:value={p.familyMHDetails} />
	{/if}

	<RadioGroup label="Do you suffer from severe nausea/vomiting after anaesthesia (PONV)?" name="ponv" options={yesNo} bind:value={p.ponv} />
</SectionCard>
