<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const u = assessment.data.upperGISymptoms;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Upper GI Symptoms" description="Symptoms affecting the oesophagus and stomach">
	<RadioGroup label="Do you have difficulty swallowing (dysphagia)?" name="dysphagia" options={yesNo} bind:value={u.dysphagia} />
	{#if u.dysphagia === 'yes'}
		<TextInput label="Please describe (solids, liquids, or both)" name="dysphagiaDetails" bind:value={u.dysphagiaDetails} />
	{/if}

	<RadioGroup label="Do you have pain on swallowing (odynophagia)?" name="odynophagia" options={yesNo} bind:value={u.odynophagia} />

	<RadioGroup label="Do you experience heartburn or acid reflux?" name="heartburn" options={yesNo} bind:value={u.heartburn} />
	{#if u.heartburn === 'yes'}
		<TextInput label="How often?" name="heartburnFrequency" bind:value={u.heartburnFrequency} placeholder="e.g. daily, weekly" />
	{/if}

	<RadioGroup label="Do you experience nausea?" name="nausea" options={yesNo} bind:value={u.nausea} />

	<RadioGroup label="Do you experience vomiting?" name="vomiting" options={yesNo} bind:value={u.vomiting} />
	{#if u.vomiting === 'yes'}
		<TextArea label="Describe the vomiting (frequency, blood present, etc.)" name="vomitingDetails" bind:value={u.vomitingDetails} />
	{/if}

	<RadioGroup label="Do you feel full quickly after eating (early satiety)?" name="earlySatiety" options={yesNo} bind:value={u.earlySatiety} />
</SectionCard>
