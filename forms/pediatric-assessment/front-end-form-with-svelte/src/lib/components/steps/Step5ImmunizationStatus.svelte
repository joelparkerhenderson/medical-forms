<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const im = assessment.data.immunizationStatus;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Immunization Status" description="Vaccination record and any concerns">
	<RadioGroup label="Are the child's immunizations up to date?" name="upToDate" options={yesNo} bind:value={im.upToDate} required />
	{#if im.upToDate === 'no'}
		<TextArea label="Which vaccinations are missing?" name="missingVacc" bind:value={im.missingVaccinations} placeholder="e.g., MMR, DTP, Polio..." />
	{/if}

	<RadioGroup label="Has the child had any adverse reactions to vaccinations?" name="adverseReactions" options={yesNo} bind:value={im.adverseReactions} />
	{#if im.adverseReactions === 'yes'}
		<TextArea label="Please describe the adverse reaction(s)" name="adverseDetails" bind:value={im.adverseReactionDetails} />
	{/if}

	<RadioGroup label="Are there any vaccination exemptions?" name="exemptions" options={yesNo} bind:value={im.exemptions} />
	{#if im.exemptions === 'yes'}
		<TextArea label="Please describe the exemption(s)" name="exemptionDetails" bind:value={im.exemptionDetails} placeholder="e.g., medical, religious, philosophical..." />
	{/if}
</SectionCard>
