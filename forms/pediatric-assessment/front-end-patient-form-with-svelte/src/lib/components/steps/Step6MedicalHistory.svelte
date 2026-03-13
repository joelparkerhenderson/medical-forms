<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const mh = assessment.data.medicalHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Medical History" description="Previous and ongoing medical conditions">
	<RadioGroup label="Does the child have any chronic conditions?" name="chronic" options={yesNo} bind:value={mh.chronicConditions} />
	{#if mh.chronicConditions === 'yes'}
		<TextArea label="Please describe chronic conditions" name="chronicDetails" bind:value={mh.chronicConditionDetails} placeholder="e.g., asthma, eczema, epilepsy..." />
	{/if}

	<RadioGroup label="Has the child had any previous hospitalizations?" name="hospitalizations" options={yesNo} bind:value={mh.previousHospitalizations} />
	{#if mh.previousHospitalizations === 'yes'}
		<TextArea label="Please describe hospitalizations" name="hospitalDetails" bind:value={mh.hospitalizationDetails} placeholder="Reason, duration, and dates..." />
	{/if}

	<RadioGroup label="Has the child had any previous surgeries?" name="surgeries" options={yesNo} bind:value={mh.previousSurgeries} />
	{#if mh.previousSurgeries === 'yes'}
		<TextArea label="Please describe surgeries" name="surgeryDetails" bind:value={mh.surgeryDetails} placeholder="Type of surgery and date..." />
	{/if}

	<RadioGroup label="Does the child have recurring infections?" name="infections" options={yesNo} bind:value={mh.recurringInfections} />
	{#if mh.recurringInfections === 'yes'}
		<TextArea label="Please describe recurring infections" name="infectionDetails" bind:value={mh.infectionDetails} placeholder="e.g., ear infections, tonsillitis..." />
	{/if}
</SectionCard>
