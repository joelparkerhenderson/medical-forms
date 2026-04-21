<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const p = assessment.data.periodontalAssessment;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Periodontal Assessment" description="Gum health and supporting structures">
	<RadioGroup label="Do your gums bleed when brushing or flossing?" name="gumBleeding" options={yesNo} bind:value={p.gumBleeding} />

	<RadioGroup label="Are any pocket depths above normal (>3mm)?" name="pocketDepths" options={yesNo} bind:value={p.pocketDepthsAboveNormal} />
	{#if p.pocketDepthsAboveNormal === 'yes'}
		<TextInput label="Pocket depth details" name="pocketDepthDetails" bind:value={p.pocketDepthDetails} placeholder="e.g. 5mm on 16 mesial" />
	{/if}

	<RadioGroup label="Is there gum recession?" name="gumRecession" options={yesNo} bind:value={p.gumRecession} />
	{#if p.gumRecession === 'yes'}
		<TextInput label="Recession details" name="gumRecessionDetails" bind:value={p.gumRecessionDetails} placeholder="e.g. 2mm recession on 31 labial" />
	{/if}

	<RadioGroup label="Is there any tooth mobility?" name="toothMobility" options={yesNo} bind:value={p.toothMobility} />
	{#if p.toothMobility === 'yes'}
		<TextInput label="Mobility details" name="mobilityDetails" bind:value={p.mobilityDetails} placeholder="e.g. Grade II mobility on 41" />
	{/if}

	<RadioGroup label="Is there furcation involvement?" name="furcation" options={yesNo} bind:value={p.furcationInvolvement} />
	{#if p.furcationInvolvement === 'yes'}
		<TextInput label="Furcation details" name="furcationDetails" bind:value={p.furcationDetails} placeholder="e.g. Class II furcation on 36" />
	{/if}
</SectionCard>
