<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const f = assessment.data.functionalCommunication;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	const impactOptions = [
		{ value: 'mild', label: 'Mild' },
		{ value: 'moderate', label: 'Moderate' },
		{ value: 'severe', label: 'Severe' }
	];
</script>

<SectionCard title="Functional & Communication" description="Daily life impact, hearing aid candidacy, and assistive devices">
	<RadioGroup label="Do you have communication difficulties?" name="commDifficulties" options={yesNo} bind:value={f.communicationDifficulties} />
	{#if f.communicationDifficulties === 'yes'}
		<TextArea label="Please describe your communication difficulties" name="commDetails" bind:value={f.communicationDetails} placeholder="e.g., difficulty in noisy environments, phone conversations..." />
	{/if}

	<RadioGroup label="Are you a candidate for hearing aids?" name="hearingAidCandidacy" options={yesNo} bind:value={f.hearingAidCandidacy} />

	<RadioGroup label="Do you need assistive listening devices?" name="assistiveNeeds" options={yesNo} bind:value={f.assistiveDeviceNeeds} />
	{#if f.assistiveDeviceNeeds === 'yes'}
		<TextInput label="What assistive devices are needed?" name="assistiveDetails" bind:value={f.assistiveDeviceDetails} placeholder="e.g., amplified phone, TV streamer, alerting devices" />
	{/if}

	<SelectInput
		label="Impact on work"
		name="workImpact"
		options={impactOptions}
		bind:value={f.workImpact}
	/>

	<SelectInput
		label="Impact on social life"
		name="socialImpact"
		options={impactOptions}
		bind:value={f.socialImpact}
	/>

	<NumberInput
		label="Hearing Handicap Inventory for the Elderly (HHIE) Score"
		name="hhieScore"
		bind:value={f.hhieScore}
		min={0}
		max={100}
		unit="0-100"
	/>
</SectionCard>
