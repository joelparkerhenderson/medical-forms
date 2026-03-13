<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const m = assessment.data.medicalHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Medical History" description="Relevant medical conditions that may affect dental treatment">
	<RadioGroup label="Do you have any cardiovascular disease?" name="cardiovascular" options={yesNo} bind:value={m.cardiovascularDisease} />
	{#if m.cardiovascularDisease === 'yes'}
		<TextInput label="Please provide details" name="cardiovascularDetails" bind:value={m.cardiovascularDetails} placeholder="e.g. Heart valve replacement, endocarditis history" />
	{/if}

	<RadioGroup label="Do you have diabetes?" name="diabetes" options={yesNo} bind:value={m.diabetes} />
	{#if m.diabetes === 'yes'}
		<SelectInput
			label="Diabetes type"
			name="diabetesType"
			options={[
				{ value: 'type1', label: 'Type 1' },
				{ value: 'type2', label: 'Type 2' }
			]}
			bind:value={m.diabetesType}
			required
		/>
		<RadioGroup label="Is your diabetes well controlled?" name="diabetesControlled" options={yesNo} bind:value={m.diabetesControlled} />
	{/if}

	<RadioGroup label="Do you have a bleeding disorder?" name="bleedingDisorder" options={yesNo} bind:value={m.bleedingDisorder} />
	{#if m.bleedingDisorder === 'yes'}
		<TextInput label="Please provide details" name="bleedingDetails" bind:value={m.bleedingDetails} placeholder="e.g. Haemophilia, von Willebrand disease" />
	{/if}

	<RadioGroup label="Have you ever taken bisphosphonates (e.g. Alendronate, Zoledronic acid)?" name="bisphosphonateUse" options={yesNo} bind:value={m.bisphosphonateUse} />
	{#if m.bisphosphonateUse === 'yes'}
		<TextInput label="Bisphosphonate details" name="bisphosphonateDetails" bind:value={m.bisphosphonateDetails} placeholder="e.g. Drug name, duration of use" />
	{/if}

	<RadioGroup label="Have you had radiation therapy to the head or neck?" name="radiationTherapy" options={yesNo} bind:value={m.radiationTherapyHeadNeck} />
	{#if m.radiationTherapyHeadNeck === 'yes'}
		<TextInput label="Radiation therapy details" name="radiationDetails" bind:value={m.radiationDetails} placeholder="e.g. Area treated, when completed" />
	{/if}

	<RadioGroup label="Are you immunosuppressed?" name="immunosuppression" options={yesNo} bind:value={m.immunosuppression} />
	{#if m.immunosuppression === 'yes'}
		<TextInput label="Please provide details" name="immunosuppressionDetails" bind:value={m.immunosuppressionDetails} placeholder="e.g. HIV, organ transplant, chemotherapy" />
	{/if}
</SectionCard>
