<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const se = assessment.data.socialEnvironmental;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Social & Environmental" description="Home, school, and social environment">
	<TextArea label="Home Environment" name="homeEnv" bind:value={se.homeEnvironment} placeholder="Describe the child's home environment, living situation..." />

	<SelectInput
		label="School Performance"
		name="schoolPerf"
		options={[
			{ value: 'above-average', label: 'Above Average' },
			{ value: 'average', label: 'Average' },
			{ value: 'below-average', label: 'Below Average' },
			{ value: 'not-applicable', label: 'Not Applicable (pre-school age)' }
		]}
		bind:value={se.schoolPerformance}
	/>

	<RadioGroup label="Are there any behavioural concerns?" name="behavioural" options={yesNo} bind:value={se.behaviouralConcerns} />
	{#if se.behaviouralConcerns === 'yes'}
		<TextArea label="Please describe behavioural concerns" name="behaviouralDetails" bind:value={se.behaviouralConcernDetails} placeholder="e.g., aggression, hyperactivity, social withdrawal..." />
	{/if}

	<RadioGroup label="Are there any safeguarding concerns?" name="safeguarding" options={yesNo} bind:value={se.safeguardingConcerns} />
	{#if se.safeguardingConcerns === 'yes'}
		<TextArea label="Please describe safeguarding concerns" name="safeguardingDetails" bind:value={se.safeguardingDetails} placeholder="Describe any safeguarding concerns - this information is treated as highly confidential" />
	{/if}

	<NumberInput label="Screen Time" name="screenTime" bind:value={se.screenTimeHoursPerDay} unit="hours/day" min={0} max={24} step={0.5} />
</SectionCard>
