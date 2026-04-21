<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const h = assessment.data.hearingHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Hearing History" description="Previous hearing issues and noise exposure">
	<RadioGroup label="Have you been exposed to loud noise?" name="noiseExposure" options={yesNo} bind:value={h.noiseExposure} />

	<RadioGroup label="Occupational noise exposure (e.g., factory, construction, military)?" name="occNoise" options={yesNo} bind:value={h.occupationalNoise} />
	{#if h.occupationalNoise === 'yes'}
		<TextInput label="Please describe" name="occNoiseDetails" bind:value={h.occupationalNoiseDetails} />
	{/if}

	<RadioGroup label="Recreational noise exposure (e.g., concerts, headphones, shooting)?" name="recNoise" options={yesNo} bind:value={h.recreationalNoise} />
	{#if h.recreationalNoise === 'yes'}
		<TextInput label="Please describe" name="recNoiseDetails" bind:value={h.recreationalNoiseDetails} />
	{/if}

	<RadioGroup label="Have you had previous hearing tests?" name="prevTests" options={yesNo} bind:value={h.previousHearingTests} />
	{#if h.previousHearingTests === 'yes'}
		<TextArea label="Describe previous test results" name="prevTestDetails" bind:value={h.previousTestDetails} />
	{/if}

	<RadioGroup label="Do you currently use hearing aids?" name="hearingAidUse" options={yesNo} bind:value={h.hearingAidUse} />
	{#if h.hearingAidUse === 'yes'}
		<TextInput label="Hearing aid details (make, model, duration of use)" name="hearingAidDetails" bind:value={h.hearingAidDetails} />
	{/if}
</SectionCard>
