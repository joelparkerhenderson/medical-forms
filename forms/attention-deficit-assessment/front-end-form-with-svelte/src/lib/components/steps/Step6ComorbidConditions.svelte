<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const cc = assessment.data.comorbidConditions;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Comorbid Conditions" description="ADHD commonly co-occurs with other conditions. Please indicate if you have any of the following.">
	<RadioGroup
		label="Anxiety disorder"
		name="anxiety"
		options={yesNoOptions}
		bind:value={cc.anxiety}
	/>
	{#if cc.anxiety === 'yes'}
		<TextArea label="Anxiety details" name="anxietyDetails" bind:value={cc.anxietyDetails} placeholder="Type, treatment, severity..." />
	{/if}

	<RadioGroup
		label="Depression"
		name="depression"
		options={yesNoOptions}
		bind:value={cc.depression}
	/>
	{#if cc.depression === 'yes'}
		<TextArea label="Depression details" name="depressionDetails" bind:value={cc.depressionDetails} placeholder="Diagnosis, treatment, current status..." />
	{/if}

	<RadioGroup
		label="Substance use (current or past)"
		name="substanceUse"
		options={yesNoOptions}
		bind:value={cc.substanceUse}
	/>
	{#if cc.substanceUse === 'yes'}
		<TextArea label="Substance use details" name="substanceUseDetails" bind:value={cc.substanceUseDetails} placeholder="Substances, duration, treatment..." />
	{/if}

	<RadioGroup
		label="Sleep disorders (insomnia, sleep apnoea, etc.)"
		name="sleepDisorders"
		options={yesNoOptions}
		bind:value={cc.sleepDisorders}
	/>
	{#if cc.sleepDisorders === 'yes'}
		<TextArea label="Sleep disorder details" name="sleepDisordersDetails" bind:value={cc.sleepDisordersDetails} placeholder="Type, treatment, impact on daily functioning..." />
	{/if}

	<RadioGroup
		label="Learning disabilities (dyslexia, dyscalculia, etc.)"
		name="learningDisabilities"
		options={yesNoOptions}
		bind:value={cc.learningDisabilities}
	/>
	{#if cc.learningDisabilities === 'yes'}
		<TextArea label="Learning disability details" name="learningDisabilitiesDetails" bind:value={cc.learningDisabilitiesDetails} placeholder="Type, diagnosis, accommodations..." />
	{/if}

	<RadioGroup
		label="Autism spectrum disorder"
		name="autismSpectrum"
		options={yesNoOptions}
		bind:value={cc.autismSpectrum}
	/>
	{#if cc.autismSpectrum === 'yes'}
		<TextArea label="ASD details" name="autismSpectrumDetails" bind:value={cc.autismSpectrumDetails} placeholder="Diagnosis, level, support needs..." />
	{/if}
</SectionCard>
