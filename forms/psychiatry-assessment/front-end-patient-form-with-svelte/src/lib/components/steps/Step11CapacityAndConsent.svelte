<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const c = assessment.data.capacityAndConsent;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Capacity & Consent" description="Decision-making capacity and treatment preferences">
	<SelectInput
		label="Decision-Making Capacity"
		name="capacity"
		options={[
			{ value: 'has-capacity', label: 'Has capacity' },
			{ value: 'lacks-capacity', label: 'Lacks capacity' },
			{ value: 'fluctuating', label: 'Fluctuating capacity' },
			{ value: 'not-assessed', label: 'Not yet assessed' }
		]}
		bind:value={c.decisionMakingCapacity}
	/>
	{#if c.decisionMakingCapacity === 'lacks-capacity' || c.decisionMakingCapacity === 'fluctuating'}
		<TextArea label="Capacity Assessment Details" name="capacityDetails" bind:value={c.capacityDetails} placeholder="Specific decisions affected, evidence for assessment" />
	{/if}

	<RadioGroup label="Advance directives in place?" name="advanceDirectives" options={yesNo} bind:value={c.advanceDirectives} />
	{#if c.advanceDirectives === 'yes'}
		<TextArea label="Advance Directive Details" name="advanceDirectiveDetails" bind:value={c.advanceDirectiveDetails} placeholder="Type of directive, key provisions" />
	{/if}

	<RadioGroup label="Power of attorney designated?" name="poa" options={yesNo} bind:value={c.powerOfAttorney} />
	{#if c.powerOfAttorney === 'yes'}
		<TextArea label="Power of Attorney Details" name="poaDetails" bind:value={c.powerOfAttorneyDetails} placeholder="Name, relationship, scope of authority" />
	{/if}

	<TextArea label="Treatment Preferences" name="treatmentPrefs" bind:value={c.treatmentPreferences} placeholder="Patient's preferences regarding treatment, medication, hospitalisation" />
</SectionCard>
