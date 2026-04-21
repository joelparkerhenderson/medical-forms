<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const n = assessment.data.neurological;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Neurological" description="Brain and nerve conditions">
	<RadioGroup label="Have you had a stroke or TIA (mini-stroke)?" name="stroke" options={yesNo} bind:value={n.strokeOrTIA} />
	{#if n.strokeOrTIA === 'yes'}
		<TextInput label="Please provide details (when, residual effects)" name="strokeDetails" bind:value={n.strokeDetails} />
	{/if}

	<RadioGroup label="Do you have epilepsy?" name="epilepsy" options={yesNo} bind:value={n.epilepsy} />
	{#if n.epilepsy === 'yes'}
		<RadioGroup label="Is your epilepsy well controlled?" name="epilepsyCtrl" options={yesNo} bind:value={n.epilepsyControlled} required />
	{/if}

	<RadioGroup label="Do you have any neuromuscular disease (e.g. MS, MND, myasthenia)?" name="neuromusc" options={yesNo} bind:value={n.neuromuscularDisease} />
	{#if n.neuromuscularDisease === 'yes'}
		<TextInput label="Please provide details" name="neuroDetails" bind:value={n.neuromuscularDetails} />
	{/if}

	<RadioGroup label="Do you have raised intracranial pressure?" name="icp" options={yesNo} bind:value={n.raisedICP} />
</SectionCard>
